import { useDeferredValue, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import {
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useDeleteDepartmentsBulkMutation,
  useRecoverDepartmentMutation,
  useRecoverDepartmentsBulkMutation,
  useUpdateDepartmentMutation,
} from "@/features/departments/queries/use-mutations"
import { useDepartmentsQuery } from "@/features/departments/queries/use-queries"
import type {
  Department,
  DepartmentRequest,
} from "@/features/departments/schemas/department-schemas"
import {
  collectAllNodeIds,
  filterDepartmentTree,
  flattenDepartmentTreeWithDepth,
  getDepartmentStats,
  getUnitTypeByDepth,
  type DepartmentUnitType,
} from "@/features/departments/utils/tree"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"
import { countSelectedByStatus } from "@/utils/selection"

export type StatusFilter = "active" | "all" | "inactive"
export type TypeFilter = "all" | DepartmentUnitType
export type DepartmentViewMode = "table" | "tree"

function matchesStatus(isActive: boolean, filter: StatusFilter) {
  return (
    filter === "all" ||
    (filter === "active" && isActive) ||
    (filter === "inactive" && !isActive)
  )
}

function matchesType(depth: number, filter: TypeFilter) {
  return filter === "all" || getUnitTypeByDepth(depth) === filter
}

const PARAM_DEFAULTS = {
  mode: "table",
  search: "",
  status: "all",
  type: "all",
} as const

type Param = keyof typeof PARAM_DEFAULTS

const URL_PARAM_KEYS = {
  mode: "mode",
  search: "q",
  status: "status",
  type: "type",
} as const satisfies Record<Param, string>

export function useDepartmentDashboard() {
  const departmentsQuery = useDepartmentsQuery()
  const createDepartment = useCreateDepartmentMutation()
  const updateDepartment = useUpdateDepartmentMutation()
  const deleteDepartment = useDeleteDepartmentMutation()
  const recoverDepartment = useRecoverDepartmentMutation()
  const deleteDepartmentsBulk = useDeleteDepartmentsBulkMutation()
  const recoverDepartmentsBulk = useRecoverDepartmentsBulkMutation()
  const { canCreate, canDelete, canUpdate } =
    useResourcePermissions("department")

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

  const appliedSearch = getParam("search")
  const appliedStatus = getParam("status") as StatusFilter
  const appliedType = getParam("type") as TypeFilter
  const viewMode: DepartmentViewMode =
    getParam("mode") === "tree" ? "tree" : "table"

  const [pendingSearch, setPendingSearch] = useState(appliedSearch)
  const [pendingStatus, setPendingStatus] =
    useState<StatusFilter>(appliedStatus)
  const [pendingType, setPendingType] = useState<TypeFilter>(appliedType)

  const isFiltered =
    appliedSearch.trim() !== "" ||
    appliedStatus !== "all" ||
    appliedType !== "all"

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department>()
  const [viewingDepartment, setViewingDepartment] = useState<Department>()
  const [presetParentId, setPresetParentId] = useState<string>()
  const [statusDepartment, setStatusDepartment] = useState<Department>()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [pendingBulkAction, setPendingBulkAction] = useState<
    "deactivate" | "recover" | null
  >(null)

  const departmentTree = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data]
  )

  const stats = useMemo(
    () => getDepartmentStats(departmentTree),
    [departmentTree]
  )

  // Selection spans the whole tree (collapsed or filtered-out rows stay selected).
  const allDepartments = useMemo(
    () => flattenDepartmentTreeWithDepth(departmentTree),
    [departmentTree]
  )

  const selectedStatusCounts = useMemo(
    () =>
      countSelectedByStatus(
        allDepartments,
        selectedIds,
        (department) => department.isActive ?? true
      ),
    [allDepartments, selectedIds]
  )

  const deferredSearch = useDeferredValue(appliedSearch)
  const normalizedSearch = deferredSearch.trim().toLocaleLowerCase("vi")

  const matchesFilters = useMemo(
    () =>
      (
        dept: {
          description?: string | null
          isActive?: boolean | null
          name: string
        },
        depth: number
      ) => {
        const matchesSearch =
          !normalizedSearch ||
          [dept.name, dept.description]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase("vi")
            .includes(normalizedSearch)

        return (
          matchesSearch &&
          matchesStatus(dept.isActive ?? true, appliedStatus) &&
          matchesType(depth, appliedType)
        )
      },
    [appliedStatus, appliedType, normalizedSearch]
  )

  const filteredTree = useMemo(
    () =>
      isFiltered
        ? filterDepartmentTree(departmentTree, matchesFilters)
        : departmentTree,
    [departmentTree, isFiltered, matchesFilters]
  )

  const flattenedList = useMemo(
    () => flattenDepartmentTreeWithDepth(filteredTree),
    [filteredTree]
  )

  // Ancestors of matches are kept in filteredTree so the diagram can still
  // show which branch a result belongs to. matchedIds pinpoints the actual
  // hits (highlighted); relevantIds is everything worth keeping full-opacity.
  const matchedIds = useMemo(() => {
    if (!isFiltered) return null
    return new Set(
      flattenedList
        .filter((item) => matchesFilters(item, item.depth))
        .map((item) => item.id)
    )
  }, [flattenedList, isFiltered, matchesFilters])

  const relevantIds = useMemo(
    () => (isFiltered ? collectAllNodeIds(filteredTree) : null),
    [filteredTree, isFiltered]
  )

  const openDetail = (department: Department) => {
    setEditingDepartment(undefined)
    setViewingDepartment(department)
  }

  const closeDetail = () => {
    setViewingDepartment(undefined)
  }

  const openCreate = (parentId?: string) => {
    setViewingDepartment(undefined)
    setEditingDepartment(undefined)
    setPresetParentId(parentId)
    setIsDialogOpen(true)
  }

  const openEdit = (department: Department) => {
    setViewingDepartment(undefined)
    setEditingDepartment(department)
    setPresetParentId(department.parentId ?? undefined)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingDepartment(undefined)
    setPresetParentId(undefined)
  }

  const requestStatusChange = (department: Department) => {
    setViewingDepartment(undefined)
    setStatusDepartment(department)
  }

  const save = async (input: DepartmentRequest) => {
    if (editingDepartment) {
      await updateDepartment.mutateAsync({
        departmentId: editingDepartment.id,
        input,
      })
    } else {
      await createDepartment.mutateAsync(input)
    }

    closeDialog()
  }

  const confirmStatusChange = async (includeChildren = false) => {
    if (!statusDepartment) return

    if (statusDepartment.isActive) {
      await deleteDepartment.mutateAsync(statusDepartment.id)
    } else {
      await recoverDepartment.mutateAsync({
        departmentId: statusDepartment.id,
        includeChildren,
      })
    }

    setStatusDepartment(undefined)
  }

  // Recovering a unit with child units asks whether the children come back too.
  const statusNeedsChildChoice = Boolean(
    statusDepartment &&
    !(statusDepartment.isActive ?? true) &&
    statusDepartment.children?.length
  )

  const toggleSelection = (departmentId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(departmentId)) {
        next.delete(departmentId)
      } else {
        next.add(departmentId)
      }
      return next
    })
  }

  const toggleAllSelection = (departmentIds: string[]) => {
    setSelectedIds((current) => {
      if (departmentIds.every((id) => current.has(id))) {
        const next = new Set(current)
        departmentIds.forEach((id) => next.delete(id))
        return next
      }
      return new Set([...current, ...departmentIds])
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const selectedIdsWhere = (isActive: boolean) =>
    allDepartments
      .filter(
        (department) =>
          selectedIds.has(department.id) &&
          (department.isActive ?? true) === isActive
      )
      .map((department) => department.id)

  const bulkRecoverNeedsChildChoice =
    pendingBulkAction === "recover" &&
    allDepartments.some(
      (department) =>
        selectedIds.has(department.id) &&
        !(department.isActive ?? true) &&
        Boolean(department.children?.length)
    )

  const confirmBulkAction = async (includeChildren = false) => {
    if (pendingBulkAction === "deactivate") {
      const ids = selectedIdsWhere(true)
      if (ids.length) await deleteDepartmentsBulk.mutateAsync(ids)
    } else if (pendingBulkAction === "recover") {
      const ids = selectedIdsWhere(false)
      if (ids.length) {
        await recoverDepartmentsBulk.mutateAsync({
          departmentIds: ids,
          includeChildren,
        })
      }
    }
    clearSelection()
    setPendingBulkAction(null)
  }

  const pendingBulkCount =
    pendingBulkAction === "deactivate"
      ? selectedStatusCounts.active
      : pendingBulkAction === "recover"
        ? selectedStatusCounts.inactive
        : 0

  const applyFilters = () => {
    setParams({
      search: pendingSearch.trim(),
      status: pendingStatus,
      type: pendingType,
    })
  }

  const resetFilters = () => {
    setPendingSearch(PARAM_DEFAULTS.search)
    setPendingStatus(PARAM_DEFAULTS.status)
    setPendingType(PARAM_DEFAULTS.type)
    setParams({
      search: PARAM_DEFAULTS.search,
      status: PARAM_DEFAULTS.status,
      type: PARAM_DEFAULTS.type,
    })
  }

  const setViewMode = (mode: DepartmentViewMode) => {
    // Rows are only selectable in the table; don't carry a hidden selection into the diagram.
    if (mode !== viewMode) clearSelection()
    setParams({ mode })
  }

  return {
    appliedSearch,
    appliedStatus,
    appliedType,
    applyFilters,
    bulkRecoverNeedsChildChoice,
    canCreate,
    canDelete,
    canUpdate,
    clearSelection,
    closeBulkActionDialog: () => setPendingBulkAction(null),
    closeDetail,
    closeDialog,
    closeStatusDialog: () => setStatusDepartment(undefined),
    confirmBulkAction,
    confirmStatusChange,
    departmentTree,
    editingDepartment,
    filteredCount: flattenedList.length,
    filteredTree,
    flattenedList,
    isDialogOpen,
    isFiltered,
    isBulkUpdating:
      deleteDepartmentsBulk.isPending || recoverDepartmentsBulk.isPending,
    isPending: departmentsQuery.isPending,
    isSaving: createDepartment.isPending || updateDepartment.isPending,
    isUpdatingStatus: deleteDepartment.isPending || recoverDepartment.isPending,
    matchedIds,
    openCreate,
    openDetail,
    openEdit,
    pendingBulkAction,
    pendingBulkCount,
    presetParentId,
    requestBulkDeactivate: () => setPendingBulkAction("deactivate"),
    requestBulkRecover: () => setPendingBulkAction("recover"),
    relevantIds,
    requestStatusChange,
    resetFilters,
    save,
    search: pendingSearch,
    selectedIds,
    selectedStatusCounts,
    setSearch: setPendingSearch,
    setStatusFilter: setPendingStatus,
    setTypeFilter: setPendingType,
    setViewMode,
    stats,
    statusDepartment,
    statusNeedsChildChoice,
    statusFilter: pendingStatus,
    toggleAllSelection,
    toggleSelection,
    typeFilter: pendingType,
    viewingDepartment,
    viewMode,
  }
}
