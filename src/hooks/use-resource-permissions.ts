import { usePermissions } from "@/features/auth/hooks/use-permissions"
import type { Permission, ResourceName } from "@/utils/permissions"

export type ResourceCapabilities = {
  canCreate: boolean
  canDelete: boolean
  canRead: boolean
  canUpdate: boolean
}

/**
 * Derives CRUD capabilities for a resource purely from the backend's naming
 * convention (`RESOURCE_ACTION`), so there is no need to hard-code individual
 * permission strings in each dashboard hook or component.
 *
 * `_ALL` wildcards and `SUPER_ADMIN_ALL` are handled automatically by the
 * underlying `usePermissions().can()` helper (via `hasPermissionInfo`).
 *
 * @example
 * const { canCreate, canUpdate, canDelete } = useResourcePermissions("department")
 */
export function useResourcePermissions(
  resource: ResourceName
): ResourceCapabilities {
  const { can } = usePermissions()

  // e.g. "access_level" → "ACCESS_LEVEL"
  const prefix = resource.toUpperCase() as Uppercase<string>

  return {
    canCreate: can(`${prefix}_CREATE` as Permission),
    canDelete: can(`${prefix}_DELETE` as Permission),
    canRead: can(`${prefix}_READ` as Permission),
    canUpdate: can(`${prefix}_UPDATE` as Permission),
  }
}
