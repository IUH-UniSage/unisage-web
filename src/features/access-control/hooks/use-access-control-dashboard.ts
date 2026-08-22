import { useDeferredValue, useMemo, useState } from "react"

import {
  getPermissionLabel,
  getResourceLabel,
  splitPermissionName,
} from "@/features/access-control/utils/access-control-formatters"
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
} from "@/features/access-control/queries/use-mutations"
import {
  useAccessPermissionsQuery,
  useAccessRolesQuery,
} from "@/features/access-control/queries/use-queries"
import type {
  AccessPermission,
  AccessRole,
  CreatePermissionRequest,
  CreateRoleRequest,
} from "@/features/access-control/schemas/access-control-schemas"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSIONS } from "@/utils/permissions"

export type AccessControlTab = "roles" | "permissions"
export type StatusFilter = "active" | "all" | "inactive"
export type PermissionLevelFilter = "all" | "scoped" | "unrestricted"

const EMPTY_PERMISSIONS: AccessPermission[] = []
const EMPTY_ROLES: AccessRole[] = []
export const ACCESS_CONTROL_PAGE_SIZE = 5

function paginate<T>(items: T[], page: number) {
  const start = (page - 1) * ACCESS_CONTROL_PAGE_SIZE
  return items.slice(start, start + ACCESS_CONTROL_PAGE_SIZE)
}

function matchesStatus(isActive: boolean, status: StatusFilter) {
  return (
    status === "all" ||
    (status === "active" && isActive) ||
    (status === "inactive" && !isActive)
  )
}

export function useAccessControlDashboard() {
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

  const [activeTab, setActiveTab] = useState<AccessControlTab>("roles")
  const [roleSearch, setRoleSearch] = useState("")
  const [roleStatus, setRoleStatus] = useState<StatusFilter>("all")
  const [rolePermission, setRolePermission] = useState("all")
  const [rolePage, setRolePage] = useState(1)
  const [permissionSearch, setPermissionSearch] = useState("")
  const [permissionStatus, setPermissionStatus] = useState<StatusFilter>("all")
  const [permissionLevel, setPermissionLevel] =
    useState<PermissionLevelFilter>("all")
  const [permissionPage, setPermissionPage] = useState(1)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<AccessRole>()
  const [statusRole, setStatusRole] = useState<AccessRole>()
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<AccessPermission>()
  const [statusPermission, setStatusPermission] = useState<AccessPermission>()
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(
    () => new Set()
  )
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<string>
  >(() => new Set())

  const roles = rolesQuery.data?.data ?? EMPTY_ROLES
  const permissions = permissionsQuery.data?.data ?? EMPTY_PERMISSIONS
  const deferredRoleSearch = useDeferredValue(roleSearch)
  const deferredPermissionSearch = useDeferredValue(permissionSearch)

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
        rolePermission === "all" ||
        role.permissions.some(
          (permission) => permission.name === rolePermission
        )

      return (
        matchesSearch &&
        matchesPermission &&
        matchesStatus(role.isActive, roleStatus)
      )
    })
  }, [deferredRoleSearch, rolePermission, roleStatus, roles])

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
      const matchesLevel =
        permissionLevel === "all" ||
        (permissionLevel === "unrestricted" &&
          permission.accessLevel === null) ||
        (permissionLevel === "scoped" && permission.accessLevel !== null)

      return (
        matchesSearch &&
        matchesLevel &&
        matchesStatus(permission.isActive, permissionStatus)
      )
    })
  }, [deferredPermissionSearch, permissionLevel, permissionStatus, permissions])

  const roleTotalPages = Math.max(
    1,
    Math.ceil(filteredRoles.length / ACCESS_CONTROL_PAGE_SIZE)
  )
  const permissionTotalPages = Math.max(
    1,
    Math.ceil(filteredPermissions.length / ACCESS_CONTROL_PAGE_SIZE)
  )
  const currentRolePage = Math.min(rolePage, roleTotalPages)
  const currentPermissionPage = Math.min(permissionPage, permissionTotalPages)

  const openCreateRole = () => {
    setEditingRole(undefined)
    setIsRoleDialogOpen(true)
  }

  const openEditRole = (role: AccessRole) => {
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

  const openCreatePermission = () => {
    setEditingPermission(undefined)
    setIsPermissionDialogOpen(true)
  }

  const openEditPermission = (permission: AccessPermission) => {
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

  return {
    activeTab,
    bulkDeactivateSelectedPermissions,
    bulkDeactivateSelectedRoles,
    bulkRecoverSelectedPermissions,
    bulkRecoverSelectedRoles,
    canCreatePermissions: can(PERMISSIONS.permissionCreate),
    canCreateRoles: can(PERMISSIONS.roleCreate),
    canDeletePermissions: can(PERMISSIONS.permissionDelete),
    canDeleteRoles: can(PERMISSIONS.roleDelete),
    canUpdatePermissions: can(PERMISSIONS.permissionUpdate),
    canUpdateRoles: can(PERMISSIONS.roleUpdate),
    clearPermissionSelection,
    clearRoleSelection,
    closePermissionDialog: () => setIsPermissionDialogOpen(false),
    closePermissionStatusDialog: () => setStatusPermission(undefined),
    closeRoleDialog: () => setIsRoleDialogOpen(false),
    closeStatusDialog: () => setStatusRole(undefined),
    confirmPermissionStatusChange,
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
    pagedPermissions: paginate(filteredPermissions, currentPermissionPage),
    pagedRoles: paginate(filteredRoles, currentRolePage),
    permissionLevel,
    permissionPage: currentPermissionPage,
    permissionSearch,
    permissionStatus,
    permissionTotalPages,
    permissions,
    requestPermissionStatusChange: setStatusPermission,
    requestStatusChange: setStatusRole,
    resetPermissionFilters: () => {
      setPermissionSearch("")
      setPermissionStatus("all")
      setPermissionLevel("all")
      setPermissionPage(1)
    },
    resetRoleFilters: () => {
      setRoleSearch("")
      setRoleStatus("all")
      setRolePermission("all")
      setRolePage(1)
    },
    rolePage: currentRolePage,
    rolePermission,
    rolePermissionOptions,
    roles,
    roleSearch,
    roleStatus,
    roleTotalPages,
    savePermission,
    saveRole,
    selectedPermissionIds,
    selectedRoleIds,
    setActiveTab,
    setPermissionLevel: (value: PermissionLevelFilter) => {
      setPermissionLevel(value)
      setPermissionPage(1)
    },
    setPermissionPage,
    setPermissionSearch: (value: string) => {
      setPermissionSearch(value)
      setPermissionPage(1)
    },
    setPermissionStatus: (value: StatusFilter) => {
      setPermissionStatus(value)
      setPermissionPage(1)
    },
    setRolePage,
    setRolePermission: (value: string) => {
      setRolePermission(value)
      setRolePage(1)
    },
    setRoleSearch: (value: string) => {
      setRoleSearch(value)
      setRolePage(1)
    },
    setRoleStatus: (value: StatusFilter) => {
      setRoleStatus(value)
      setRolePage(1)
    },
    statusPermission,
    statusRole,
    toggleAllPermissionsOnPage,
    toggleAllRolesOnPage,
    togglePermissionSelection,
    toggleRoleSelection,
  }
}
