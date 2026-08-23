import { useDeferredValue, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import {
  getPermissionLabel,
  getResourceLabel,
  splitPermissionName,
} from "@/features/rbac/utils/rbac-formatters"
import {
  useCreatePermissionMutation,
  useCreateRoleMutation,
  useDeletePermissionMutation,
  useDeletePermissionsBulkMutation,
  useDeleteRoleMutation,
  useDeleteRolesBulkMutation,
  useRecoverPermissionMutation,
  useRecoverPermissionsBulkMutation,
  useRecoverRoleMutation,
  useRecoverRolesBulkMutation,
  useUpdatePermissionMutation,
  useUpdateRoleMutation,
} from "@/features/rbac/queries/use-mutations"
import {
  useAccessPermissionsQuery,
  useAccessRolesQuery,
} from "@/features/rbac/queries/use-queries"
import type {
  AccessPermission,
  AccessRole,
  CreatePermissionRequest,
  CreateRoleRequest,
} from "@/features/rbac/schemas/rbac-schemas"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSIONS } from "@/utils/permissions"

export type RbacTab = "roles" | "permissions"
export type StatusFilter = "active" | "all" | "inactive"

const EMPTY_PERMISSIONS: AccessPermission[] = []
const EMPTY_ROLES: AccessRole[] = []
export const RBAC_PAGE_SIZE = 10

function paginate<T>(items: T[], page: number) {
  const start = (page - 1) * RBAC_PAGE_SIZE
  return items.slice(start, start + RBAC_PAGE_SIZE)
}

function matchesStatus(isActive: boolean, status: StatusFilter) {
  return (
    status === "all" ||
    (status === "active" && isActive) ||
    (status === "inactive" && !isActive)
  )
}

const PARAM_DEFAULTS = {
  permissionPage: "1",
  permissionSearch: "",
  permissionStatus: "all",
  rolePermission: "all",
  rolePage: "1",
  roleSearch: "",
  roleStatus: "all",
  tab: "roles",
} as const

type Param = keyof typeof PARAM_DEFAULTS

// Short keys keep the URL readable; only this map needs to change if a param
// is renamed — the rest of the hook keeps using the descriptive Param names.
const URL_PARAM_KEYS = {
  permissionPage: "pp",
  permissionSearch: "pq",
  permissionStatus: "ps",
  rolePermission: "rf",
  rolePage: "rp",
  roleSearch: "rq",
  roleStatus: "rs",
  tab: "tab",
} as const satisfies Record<Param, string>

export function useRbacDashboard() {
  const rolesQuery = useAccessRolesQuery()
  const permissionsQuery = useAccessPermissionsQuery()
  const createRole = useCreateRoleMutation()
  const updateRole = useUpdateRoleMutation()
  const deleteRole = useDeleteRoleMutation()
  const recoverRole = useRecoverRoleMutation()
  const createPermission = useCreatePermissionMutation()
  const updatePermission = useUpdatePermissionMutation()
  const deletePermission = useDeletePermissionMutation()
  const recoverPermission = useRecoverPermissionMutation()
  const deleteRolesBulk = useDeleteRolesBulkMutation()
  const recoverRolesBulk = useRecoverRolesBulkMutation()
  const deletePermissionsBulk = useDeletePermissionsBulkMutation()
  const recoverPermissionsBulk = useRecoverPermissionsBulkMutation()
  const { can } = usePermissions()

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

  const getPage = (key: Param) => {
    const page = Number.parseInt(getParam(key), 10)
    return Number.isFinite(page) && page > 0 ? page : 1
  }

  const activeTab: RbacTab =
    getParam("tab") === "permissions" ? "permissions" : "roles"
  const appliedRoleSearch = getParam("roleSearch")
  const appliedRoleStatus = getParam("roleStatus") as StatusFilter
  const appliedRolePermission = getParam("rolePermission")
  const rolePage = getPage("rolePage")
  const appliedPermissionSearch = getParam("permissionSearch")
  const appliedPermissionStatus = getParam("permissionStatus") as StatusFilter
  const permissionPage = getPage("permissionPage")

  const [pendingRoleSearch, setPendingRoleSearch] = useState(appliedRoleSearch)
  const [pendingRolePermission, setPendingRolePermission] = useState(
    appliedRolePermission
  )
  const [pendingRoleStatus, setPendingRoleStatus] =
    useState<StatusFilter>(appliedRoleStatus)
  const [pendingPermissionSearch, setPendingPermissionSearch] = useState(
    appliedPermissionSearch
  )
  const [pendingPermissionStatus, setPendingPermissionStatus] =
    useState<StatusFilter>(appliedPermissionStatus)

  const isRoleFiltersApplied =
    appliedRoleSearch.trim() !== "" ||
    appliedRolePermission !== "all" ||
    appliedRoleStatus !== "all"
  const isPermissionFiltersApplied =
    appliedPermissionSearch.trim() !== "" || appliedPermissionStatus !== "all"

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<AccessRole>()
  const [viewingRole, setViewingRole] = useState<AccessRole>()
  const [statusRole, setStatusRole] = useState<AccessRole>()
  const [pendingRoleBulkAction, setPendingRoleBulkAction] = useState<
    "deactivate" | "recover" | null
  >(null)
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<AccessPermission>()
  const [viewingPermission, setViewingPermission] = useState<AccessPermission>()
  const [statusPermission, setStatusPermission] = useState<AccessPermission>()
  const [pendingPermissionBulkAction, setPendingPermissionBulkAction] =
    useState<"deactivate" | "recover" | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(
    () => new Set()
  )
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<string>
  >(() => new Set())

  const roles = rolesQuery.data?.data ?? EMPTY_ROLES
  const permissions = permissionsQuery.data?.data ?? EMPTY_PERMISSIONS
  const deferredRoleSearch = useDeferredValue(appliedRoleSearch)
  const deferredPermissionSearch = useDeferredValue(appliedPermissionSearch)

  const rolePermissionOptions = useMemo(
    () =>
      [...new Set(permissions.map((permission) => permission.name))].sort(
        (left, right) => left.localeCompare(right)
      ),
    [permissions]
  )

  const filteredRoles = useMemo(() => {
    const normalizedSearch = deferredRoleSearch.trim().toLocaleLowerCase("vi")

    return roles.filter((role) => {
      const matchesSearch =
        !normalizedSearch ||
        [role.name, role.description, role.createdBy]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(normalizedSearch)
      const matchesPermission =
        appliedRolePermission === "all" ||
        role.permissions.some(
          (permission) => permission.name === appliedRolePermission
        )

      return (
        matchesSearch &&
        matchesPermission &&
        matchesStatus(role.isActive, appliedRoleStatus)
      )
    })
  }, [appliedRolePermission, appliedRoleStatus, deferredRoleSearch, roles])

  const filteredPermissions = useMemo(() => {
    const normalizedSearch = deferredPermissionSearch
      .trim()
      .toLocaleLowerCase("vi")

    return permissions.filter((permission) => {
      const { action, resource } = splitPermissionName(permission.name)
      const matchesSearch =
        !normalizedSearch ||
        [
          permission.name,
          getPermissionLabel(permission),
          getResourceLabel(resource),
          action,
        ]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(normalizedSearch)

      return (
        matchesSearch &&
        matchesStatus(permission.isActive, appliedPermissionStatus)
      )
    })
  }, [appliedPermissionStatus, deferredPermissionSearch, permissions])

  const roleTotalPages = Math.max(
    1,
    Math.ceil(filteredRoles.length / RBAC_PAGE_SIZE)
  )
  const permissionTotalPages = Math.max(
    1,
    Math.ceil(filteredPermissions.length / RBAC_PAGE_SIZE)
  )
  const currentRolePage = Math.min(rolePage, roleTotalPages)
  const currentPermissionPage = Math.min(permissionPage, permissionTotalPages)

  const openRoleDetail = (role: AccessRole) => {
    setViewingRole(role)
  }

  const closeRoleDetail = () => {
    setViewingRole(undefined)
  }

  const openCreateRole = () => {
    setEditingRole(undefined)
    setIsRoleDialogOpen(true)
  }

  const openEditRole = (role: AccessRole) => {
    setViewingRole(undefined)
    setEditingRole(role)
    setIsRoleDialogOpen(true)
  }

  const saveRole = async (input: CreateRoleRequest) => {
    if (editingRole) {
      await updateRole.mutateAsync({ input, roleId: editingRole.id })
    } else {
      await createRole.mutateAsync(input)
    }

    setIsRoleDialogOpen(false)
  }

  const confirmStatusChange = async () => {
    if (!statusRole) return

    if (statusRole.isActive) {
      await deleteRole.mutateAsync(statusRole.id)
    } else {
      await recoverRole.mutateAsync(statusRole.id)
    }

    setStatusRole(undefined)
  }

  const toggleRoleSelection = (roleId: string) => {
    setSelectedRoleIds((current) => {
      const next = new Set(current)
      if (next.has(roleId)) {
        next.delete(roleId)
      } else {
        next.add(roleId)
      }
      return next
    })
  }

  const toggleAllRolesOnPage = (roleIds: string[]) => {
    setSelectedRoleIds((current) => {
      const allSelected = roleIds.every((id) => current.has(id))
      if (allSelected) {
        const next = new Set(current)
        roleIds.forEach((id) => next.delete(id))
        return next
      }
      return new Set([...current, ...roleIds])
    })
  }

  const clearRoleSelection = () => setSelectedRoleIds(new Set())

  const bulkDeactivateSelectedRoles = async () => {
    const ids = roles
      .filter((role) => selectedRoleIds.has(role.id) && role.isActive)
      .map((role) => role.id)
    if (!ids.length) return
    await deleteRolesBulk.mutateAsync(ids)
    clearRoleSelection()
  }

  const bulkRecoverSelectedRoles = async () => {
    const ids = roles
      .filter((role) => selectedRoleIds.has(role.id) && !role.isActive)
      .map((role) => role.id)
    if (!ids.length) return
    await recoverRolesBulk.mutateAsync(ids)
    clearRoleSelection()
  }

  const pendingRoleBulkCount =
    pendingRoleBulkAction === "deactivate"
      ? roles.filter((role) => selectedRoleIds.has(role.id) && role.isActive)
          .length
      : pendingRoleBulkAction === "recover"
        ? roles.filter((role) => selectedRoleIds.has(role.id) && !role.isActive)
            .length
        : 0

  const confirmRoleBulkAction = async () => {
    if (pendingRoleBulkAction === "deactivate") {
      await bulkDeactivateSelectedRoles()
    } else if (pendingRoleBulkAction === "recover") {
      await bulkRecoverSelectedRoles()
    }
    setPendingRoleBulkAction(null)
  }

  const openPermissionDetail = (permission: AccessPermission) => {
    setViewingPermission(permission)
  }

  const closePermissionDetail = () => {
    setViewingPermission(undefined)
  }

  const openCreatePermission = () => {
    setEditingPermission(undefined)
    setIsPermissionDialogOpen(true)
  }

  const openEditPermission = (permission: AccessPermission) => {
    setViewingPermission(undefined)
    setEditingPermission(permission)
    setIsPermissionDialogOpen(true)
  }

  const savePermission = async (input: CreatePermissionRequest) => {
    if (editingPermission) {
      await updatePermission.mutateAsync({
        input,
        permissionId: editingPermission.id,
      })
    } else {
      await createPermission.mutateAsync(input)
    }

    setIsPermissionDialogOpen(false)
  }

  const confirmPermissionStatusChange = async () => {
    if (!statusPermission) return

    if (statusPermission.isActive) {
      await deletePermission.mutateAsync(statusPermission.id)
    } else {
      await recoverPermission.mutateAsync(statusPermission.id)
    }

    setStatusPermission(undefined)
  }

  const togglePermissionSelection = (permissionId: string) => {
    setSelectedPermissionIds((current) => {
      const next = new Set(current)
      if (next.has(permissionId)) {
        next.delete(permissionId)
      } else {
        next.add(permissionId)
      }
      return next
    })
  }

  const toggleAllPermissionsOnPage = (permissionIds: string[]) => {
    setSelectedPermissionIds((current) => {
      const allSelected = permissionIds.every((id) => current.has(id))
      if (allSelected) {
        const next = new Set(current)
        permissionIds.forEach((id) => next.delete(id))
        return next
      }
      return new Set([...current, ...permissionIds])
    })
  }

  const clearPermissionSelection = () => setSelectedPermissionIds(new Set())

  const bulkDeactivateSelectedPermissions = async () => {
    const ids = permissions
      .filter(
        (permission) =>
          selectedPermissionIds.has(permission.id) && permission.isActive
      )
      .map((permission) => permission.id)
    if (!ids.length) return
    await deletePermissionsBulk.mutateAsync(ids)
    clearPermissionSelection()
  }

  const bulkRecoverSelectedPermissions = async () => {
    const ids = permissions
      .filter(
        (permission) =>
          selectedPermissionIds.has(permission.id) && !permission.isActive
      )
      .map((permission) => permission.id)
    if (!ids.length) return
    await recoverPermissionsBulk.mutateAsync(ids)
    clearPermissionSelection()
  }

  const pendingPermissionBulkCount =
    pendingPermissionBulkAction === "deactivate"
      ? permissions.filter(
          (permission) =>
            selectedPermissionIds.has(permission.id) && permission.isActive
        ).length
      : pendingPermissionBulkAction === "recover"
        ? permissions.filter(
            (permission) =>
              selectedPermissionIds.has(permission.id) && !permission.isActive
          ).length
        : 0

  const confirmPermissionBulkAction = async () => {
    if (pendingPermissionBulkAction === "deactivate") {
      await bulkDeactivateSelectedPermissions()
    } else if (pendingPermissionBulkAction === "recover") {
      await bulkRecoverSelectedPermissions()
    }
    setPendingPermissionBulkAction(null)
  }

  return {
    activeTab,
    applyPermissionFilters: () => {
      setParams({
        permissionPage: PARAM_DEFAULTS.permissionPage,
        permissionSearch: pendingPermissionSearch,
        permissionStatus: pendingPermissionStatus,
      })
    },
    applyRoleFilters: () => {
      setParams({
        rolePage: PARAM_DEFAULTS.rolePage,
        rolePermission: pendingRolePermission,
        roleSearch: pendingRoleSearch,
        roleStatus: pendingRoleStatus,
      })
    },
    canCreatePermissions: can(PERMISSIONS.permissionCreate),
    canCreateRoles: can(PERMISSIONS.roleCreate),
    canDeletePermissions: can(PERMISSIONS.permissionDelete),
    canDeleteRoles: can(PERMISSIONS.roleDelete),
    canUpdatePermissions: can(PERMISSIONS.permissionUpdate),
    canUpdateRoles: can(PERMISSIONS.roleUpdate),
    clearPermissionSelection,
    clearRoleSelection,
    closePermissionDetail,
    closePermissionDialog: () => setIsPermissionDialogOpen(false),
    closePermissionStatusDialog: () => setStatusPermission(undefined),
    closeRoleDetail,
    closeRoleDialog: () => setIsRoleDialogOpen(false),
    closeRoleBulkActionDialog: () => setPendingRoleBulkAction(null),
    closePermissionBulkActionDialog: () => setPendingPermissionBulkAction(null),
    closeStatusDialog: () => setStatusRole(undefined),
    confirmPermissionBulkAction,
    confirmPermissionStatusChange,
    confirmRoleBulkAction,
    confirmStatusChange,
    editingPermission,
    editingRole,
    filteredPermissionCount: filteredPermissions.length,
    filteredRoleCount: filteredRoles.length,
    isBulkUpdatingPermissions:
      deletePermissionsBulk.isPending || recoverPermissionsBulk.isPending,
    isBulkUpdatingRoles:
      deleteRolesBulk.isPending || recoverRolesBulk.isPending,
    isPending: rolesQuery.isPending || permissionsQuery.isPending,
    isPermissionFiltersApplied,
    isRoleFiltersApplied,
    isPermissionDialogOpen,
    isRoleDialogOpen,
    isSavingPermission:
      createPermission.isPending || updatePermission.isPending,
    isSavingRole: createRole.isPending || updateRole.isPending,
    isUpdatingPermissionStatus:
      deletePermission.isPending || recoverPermission.isPending,
    isUpdatingStatus: deleteRole.isPending || recoverRole.isPending,
    openCreatePermission,
    openCreateRole,
    openEditPermission,
    openEditRole,
    openPermissionDetail,
    openRoleDetail,
    pagedPermissions: paginate(filteredPermissions, currentPermissionPage),
    pagedRoles: paginate(filteredRoles, currentRolePage),
    permissionPage: currentPermissionPage,
    permissionSearch: pendingPermissionSearch,
    permissionStatus: pendingPermissionStatus,
    permissionTotalPages,
    permissions,
    pendingPermissionBulkAction,
    pendingPermissionBulkCount,
    pendingRoleBulkAction,
    pendingRoleBulkCount,
    requestPermissionBulkAction: setPendingPermissionBulkAction,
    requestPermissionStatusChange: setStatusPermission,
    requestRoleBulkAction: setPendingRoleBulkAction,
    requestStatusChange: setStatusRole,
    resetPermissionFilters: () => {
      setPendingPermissionSearch(PARAM_DEFAULTS.permissionSearch)
      setPendingPermissionStatus(PARAM_DEFAULTS.permissionStatus)
      setParams({
        permissionPage: PARAM_DEFAULTS.permissionPage,
        permissionSearch: PARAM_DEFAULTS.permissionSearch,
        permissionStatus: PARAM_DEFAULTS.permissionStatus,
      })
    },
    resetRoleFilters: () => {
      setPendingRolePermission(PARAM_DEFAULTS.rolePermission)
      setPendingRoleSearch(PARAM_DEFAULTS.roleSearch)
      setPendingRoleStatus(PARAM_DEFAULTS.roleStatus)
      setParams({
        rolePage: PARAM_DEFAULTS.rolePage,
        rolePermission: PARAM_DEFAULTS.rolePermission,
        roleSearch: PARAM_DEFAULTS.roleSearch,
        roleStatus: PARAM_DEFAULTS.roleStatus,
      })
    },
    rolePage: currentRolePage,
    rolePermission: pendingRolePermission,
    rolePermissionOptions,
    roles,
    roleSearch: pendingRoleSearch,
    roleStatus: pendingRoleStatus,
    roleTotalPages,
    savePermission,
    saveRole,
    selectedPermissionIds,
    selectedRoleIds,
    setActiveTab: (value: RbacTab) => setParams({ tab: value }),
    setPermissionPage: (page: number) =>
      setParams({ permissionPage: String(page) }),
    setPermissionSearch: setPendingPermissionSearch,
    setPermissionStatus: setPendingPermissionStatus,
    setRolePage: (page: number) => setParams({ rolePage: String(page) }),
    setRolePermission: setPendingRolePermission,
    setRoleSearch: setPendingRoleSearch,
    setRoleStatus: setPendingRoleStatus,
    statusPermission,
    statusRole,
    toggleAllPermissionsOnPage,
    toggleAllRolesOnPage,
    togglePermissionSelection,
    toggleRoleSelection,
    viewingPermission,
    viewingRole,
  }
}
