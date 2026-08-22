import { useDeferredValue, useMemo, useState } from "react"

import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useDeleteUsersBulkMutation,
  useRecoverUserMutation,
  useRecoverUsersBulkMutation,
  useUpdateUserMutation,
} from "@/features/users/queries/use-mutations"
import { useUsersQuery } from "@/features/users/queries/use-queries"
import type {
  AppUser,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/features/users/schemas/user-schemas"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSIONS } from "@/utils/permissions"

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

export function useUserDashboard() {
  const usersQuery = useUsersQuery()
  const createUser = useCreateUserMutation()
  const updateUser = useUpdateUserMutation()
  const deleteUser = useDeleteUserMutation()
  const recoverUser = useRecoverUserMutation()
  const deleteUsersBulk = useDeleteUsersBulkMutation()
  const recoverUsersBulk = useRecoverUsersBulkMutation()
  const { can } = usePermissions()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser>()
  const [statusUser, setStatusUser] = useState<AppUser>()
  const [pendingBulkAction, setPendingBulkAction] = useState<
    "deactivate" | "recover" | null
  >(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  const users = usersQuery.data?.data ?? EMPTY_USERS
  const deferredSearch = useDeferredValue(search)

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
        matchesSearch && matchesStatus(user.status ?? "ACTIVE", statusFilter)
      )
    })
  }, [deferredSearch, statusFilter, users])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USER_PAGE_SIZE)
  )
  const currentPage = Math.min(page, totalPages)

  const openCreate = () => {
    setEditingUser(undefined)
    setIsDialogOpen(true)
  }

  const openEdit = (user: AppUser) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  const save = async (input: CreateUserRequest | UpdateUserRequest) => {
    if (editingUser) {
      await updateUser.mutateAsync({
        input: input as UpdateUserRequest,
        userId: editingUser.id,
      })
    } else {
      await createUser.mutateAsync(input as CreateUserRequest)
    }

    setIsDialogOpen(false)
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
    canCreate: can(PERMISSIONS.userCreate),
    canDelete: can(PERMISSIONS.userDelete),
    canUpdate: can(PERMISSIONS.userUpdate),
    clearSelection,
    closeBulkActionDialog: () => setPendingBulkAction(null),
    closeDialog: () => setIsDialogOpen(false),
    closeStatusDialog: () => setStatusUser(undefined),
    confirmBulkAction,
    confirmStatusChange,
    editingUser,
    filteredCount: filteredUsers.length,
    isBulkUpdating: deleteUsersBulk.isPending || recoverUsersBulk.isPending,
    isDialogOpen,
    isPending: usersQuery.isPending,
    isSaving: createUser.isPending || updateUser.isPending,
    isUpdatingStatus: deleteUser.isPending || recoverUser.isPending,
    openCreate,
    openEdit,
    page: currentPage,
    pagedUsers: paginate(filteredUsers, currentPage),
    pendingBulkAction,
    pendingBulkCount,
    requestBulkAction: setPendingBulkAction,
    requestStatusChange: setStatusUser,
    save,
    search,
    selectedIds,
    setPage: (p: number) => setPage(p),
    setSearch: (value: string) => {
      setSearch(value)
      setPage(1)
    },
    setStatusFilter: (value: StatusFilter) => {
      setStatusFilter(value)
      setPage(1)
    },
    statusFilter,
    statusUser,
    toggleAllOnPage,
    toggleSelection,
    totalPages,
    users,
  }
}
