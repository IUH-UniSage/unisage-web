import { useDeferredValue, useMemo, useState } from "react"

import {
  getPermissionLabel,
  getResourceLabel,
  splitPermissionName,
} from "@/features/access-control/lib/access-control-formatters"
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useRecoverRoleMutation,
  useUpdateRoleMutation,
} from "@/features/access-control/queries/use-mutations"
import {
  useAccessPermissionsQuery,
  useAccessRolesQuery,
} from "@/features/access-control/queries/use-queries"
import type {
  AccessPermission,
  AccessRole,
  CreateRoleRequest,
} from "@/features/access-control/schemas/access-control-schemas"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSIONS } from "@/lib/permissions"

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

  return {
    activeTab,
    canCreateRoles: can(PERMISSIONS.roleCreate),
    canDeleteRoles: can(PERMISSIONS.roleDelete),
    canUpdateRoles: can(PERMISSIONS.roleUpdate),
    closeRoleDialog: () => setIsRoleDialogOpen(false),
    closeStatusDialog: () => setStatusRole(undefined),
    confirmStatusChange,
    editingRole,
    filteredPermissionCount: filteredPermissions.length,
    filteredRoleCount: filteredRoles.length,
    isPending: rolesQuery.isPending || permissionsQuery.isPending,
    isRoleDialogOpen,
    isSavingRole: createRole.isPending || updateRole.isPending,
    isUpdatingStatus: deleteRole.isPending || recoverRole.isPending,
    openCreateRole,
    openEditRole,
    pagedPermissions: paginate(filteredPermissions, currentPermissionPage),
    pagedRoles: paginate(filteredRoles, currentRolePage),
    permissionLevel,
    permissionPage: currentPermissionPage,
    permissionSearch,
    permissionStatus,
    permissionTotalPages,
    permissions,
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
    saveRole,
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
    statusRole,
  }
}
