import { useMemo, useState } from "react"

import { usePermissions } from "@/features/auth/hooks/use-permissions"
import {
  equalPermissionSets,
  groupPermissions,
} from "@/features/access-control/lib/access-control-formatters"
import { useUpdateRoleMutation } from "@/features/access-control/queries/use-mutations"
import {
  useAccessPermissionsQuery,
  useAccessRolesQuery,
} from "@/features/access-control/queries/use-queries"
import type {
  AccessPermission,
  AccessRole,
} from "@/features/access-control/schemas/access-control-schemas"
import { PERMISSIONS } from "@/lib/permissions"

const EMPTY_PERMISSIONS: AccessPermission[] = []
const EMPTY_ROLES: AccessRole[] = []

export function useAccessControlDashboard() {
  const rolesQuery = useAccessRolesQuery()
  const permissionsQuery = useAccessPermissionsQuery()
  const updateRole = useUpdateRoleMutation()
  const { can } = usePermissions()
  const [selectedRoleId, setSelectedRoleId] = useState<string>()
  const [permissionSearch, setPermissionSearch] = useState("")
  const [draftPermissionIds, setDraftPermissionIds] = useState<string[] | null>(
    null
  )

  const roles = rolesQuery.data?.data ?? EMPTY_ROLES
  const permissions = permissionsQuery.data?.data ?? EMPTY_PERMISSIONS
  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) ?? roles[0]
  const permissionGroups = useMemo(
    () => groupPermissions(permissions, permissionSearch),
    [permissionSearch, permissions]
  )
  const originalPermissionIds =
    selectedRole?.permissions.map((permission) => permission.id) ?? []
  const activePermissionIds = draftPermissionIds ?? originalPermissionIds
  const isDirty = !equalPermissionSets(
    activePermissionIds,
    originalPermissionIds
  )
  const canUpdateRoles = can(PERMISSIONS.roleUpdate)

  const selectRole = (role: AccessRole) => {
    setSelectedRoleId(role.id)
    setDraftPermissionIds(null)
  }

  const togglePermission = (permission: AccessPermission) => {
    setDraftPermissionIds((current) => {
      const permissionIds = current ?? originalPermissionIds

      if (permissionIds.includes(permission.id)) {
        return permissionIds.filter((id) => id !== permission.id)
      }

      const permissionIdsWithSameName = new Set(
        permissions
          .filter((candidate) => candidate.name === permission.name)
          .map((candidate) => candidate.id)
      )

      return [
        ...permissionIds.filter((id) => !permissionIdsWithSameName.has(id)),
        permission.id,
      ]
    })
  }

  const saveRole = () => {
    if (!selectedRole) return

    updateRole.mutate(
      {
        input: {
          description: selectedRole.description ?? null,
          isActive: selectedRole.isActive,
          isSystemRole: selectedRole.isSystemRole,
          name: selectedRole.name,
          permissionIds: activePermissionIds,
        },
        roleId: selectedRole.id,
      },
      {
        onSuccess: (updatedRole) => {
          setDraftPermissionIds(
            updatedRole.permissions.map((permission) => permission.id)
          )
        },
      }
    )
  }

  return {
    activePermissionIds,
    canUpdateRoles,
    isDirty,
    isPending: rolesQuery.isPending || permissionsQuery.isPending,
    isSaving: updateRole.isPending,
    permissionGroups,
    permissions,
    permissionSearch,
    resetPermissions: () => setDraftPermissionIds(null),
    roles,
    saveRole,
    selectRole,
    selectedRole,
    setPermissionSearch,
    togglePermission,
  }
}
