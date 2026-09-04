import { useDeferredValue, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import {
  useDeleteUserMutation,
  useDeleteUsersBulkMutation,
  useRecoverUserMutation,
  useRecoverUsersBulkMutation,
} from "@/features/users/queries/use-mutations"
import { useUsersQuery } from "@/features/users/queries/use-queries"
import type { AppUser } from "@/features/users/schemas/user-schemas"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"

export type StatusFilter = "ACTIVE" | "all" | "INACTIVE"

const EMPTY_USERS: AppUser[] = []
export const USER_PAGE_SIZE = 10

function paginate<T>(items: T[], page: number) {
  const start = (page - 1) * USER_PAGE_SIZE
  return items.slice(start, start + USER_PAGE_SIZE)
}

function matchesStatus(userStatus: string, filter: StatusFilter) {
  return filter === "all" || userStatus === filter
}

const PARAM_DEFAULTS = {
  page: "1",
  search: "",
  status: "all",
} as const

type Param = keyof typeof PARAM_DEFAULTS

const URL_PARAM_KEYS = {
  page: "page",
  search: "q",
  status: "status",
} as const satisfies Record<Param, string>

export function useUserDashboard() {
  const usersQuery = useUsersQuery()
  const deleteUser = useDeleteUserMutation()
  const recoverUser = useRecoverUserMutation()
  const deleteUsersBulk = useDeleteUsersBulkMutation()
  const recoverUsersBulk = useRecoverUsersBulkMutation()
  const { canCreate, canDelete, canUpdate } = useResourcePermissions("user")

  const [searchParams, setSearchParams] = useSearchParams()

  const getParam = (key: Param) =>
    searchParams.get(URL_PARAM_KEYS[key]) ?? PARAM_DEFAULTS[key]

  const setParams = (updates: Partial<Record<Param, string>>) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const key of Object.keys(updates) as Param[]) {
          const value = updates[key]
          const urlKey = URL_PARAM_KEYS[key]
          if (value === undefined || value === PARAM_DEFAULTS[key]) {
            next.delete(urlKey)
          } else {
            next.set(urlKey, value)
          }
        }
        return next
      },
      { replace: true }
    )
  }

  const getPage = () => {
    const p = Number.parseInt(getParam("page"), 10)
    return Number.isFinite(p) && p > 0 ? p : 1
  }

  // Applied filters (from URL)
  const appliedSearch = getParam("search")
  const appliedStatus = getParam("status") as StatusFilter
  const page = getPage()

  // Pending filters (in UI inputs before pressing 'Lọc')
  const [pendingSearch, setPendingSearch] = useState(appliedSearch)
  const [pendingStatus, setPendingStatus] =
    useState<StatusFilter>(appliedStatus)

  const isFiltered = appliedSearch.trim() !== "" || appliedStatus !== "all"

  const [statusUser, setStatusUser] = useState<AppUser>()
  const [pendingBulkAction, setPendingBulkAction] = useState<
    "deactivate" | "recover" | null
  >(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  const users = usersQuery.data?.data ?? EMPTY_USERS
  const deferredSearch = useDeferredValue(appliedSearch)

  const filteredUsers = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLocaleLowerCase("vi")

    return users.filter((user) => {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ")
      const matchesSearch =
        !normalizedSearch ||
        [fullName, user.email, user.code, user.roleName]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(normalizedSearch)

      return (
        matchesSearch && matchesStatus(user.status ?? "ACTIVE", appliedStatus)
      )
    })
  }, [appliedStatus, deferredSearch, users])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USER_PAGE_SIZE)
  )
  const currentPage = Math.min(page, totalPages)

  const applyFilters = () => {
    setParams({
      page: "1",
      search: pendingSearch.trim(),
      status: pendingStatus,
    })
  }

  const resetFilters = () => {
    setPendingSearch(PARAM_DEFAULTS.search)
    setPendingStatus(PARAM_DEFAULTS.status)
    setParams({
      page: PARAM_DEFAULTS.page,
      search: PARAM_DEFAULTS.search,
      status: PARAM_DEFAULTS.status,
    })
  }

  const setPage = (p: number) => {
    setParams({ page: String(p) })
  }

  const confirmStatusChange = async () => {
    if (!statusUser) return

    if (statusUser.status === "ACTIVE") {
      await deleteUser.mutateAsync(statusUser.id)
    } else {
      await recoverUser.mutateAsync(statusUser.id)
    }

    setStatusUser(undefined)
  }

  const toggleSelection = (userId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  const toggleAllOnPage = (userIds: string[]) => {
    setSelectedIds((current) => {
      const allSelected = userIds.every((id) => current.has(id))
      if (allSelected) {
        const next = new Set(current)
        userIds.forEach((id) => next.delete(id))
        return next
      }
      return new Set([...current, ...userIds])
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const bulkDeactivate = async () => {
    const ids = users
      .filter((user) => selectedIds.has(user.id) && user.status === "ACTIVE")
      .map((user) => user.id)
    if (!ids.length) return
    await deleteUsersBulk.mutateAsync(ids)
    clearSelection()
  }

  const bulkRecover = async () => {
    const ids = users
      .filter((user) => selectedIds.has(user.id) && user.status !== "ACTIVE")
      .map((user) => user.id)
    if (!ids.length) return
    await recoverUsersBulk.mutateAsync(ids)
    clearSelection()
  }

  const pendingBulkCount =
    pendingBulkAction === "deactivate"
      ? users.filter(
          (user) => selectedIds.has(user.id) && user.status === "ACTIVE"
        ).length
      : pendingBulkAction === "recover"
        ? users.filter(
            (user) => selectedIds.has(user.id) && user.status !== "ACTIVE"
          ).length
        : 0

  const confirmBulkAction = async () => {
    if (pendingBulkAction === "deactivate") {
      await bulkDeactivate()
    } else if (pendingBulkAction === "recover") {
      await bulkRecover()
    }
    setPendingBulkAction(null)
  }

  return {
    appliedSearch,
    appliedStatus,
    applyFilters,
    canCreate,
    canDelete,
    canUpdate,
    clearSelection,
    closeBulkActionDialog: () => setPendingBulkAction(null),
    closeStatusDialog: () => setStatusUser(undefined),
    confirmBulkAction,
    confirmStatusChange,
    filteredCount: filteredUsers.length,
    isBulkUpdating: deleteUsersBulk.isPending || recoverUsersBulk.isPending,
    isFiltered,
    isPending: usersQuery.isPending,
    isUpdatingStatus: deleteUser.isPending || recoverUser.isPending,
    page: currentPage,
    pagedUsers: paginate(filteredUsers, currentPage),
    pendingBulkAction,
    pendingBulkCount,
    requestBulkAction: setPendingBulkAction,
    requestStatusChange: setStatusUser,
    resetFilters,
    search: pendingSearch,
    selectedIds,
    setPage,
    setSearch: setPendingSearch,
    setStatusFilter: setPendingStatus,
    statusFilter: pendingStatus,
    statusUser,
    toggleAllOnPage,
    toggleSelection,
    totalPages,
    users,
  }
}
