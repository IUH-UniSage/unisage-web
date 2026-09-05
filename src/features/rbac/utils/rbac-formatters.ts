import { getResourceTypeLabel } from "@/constants/resource-types"
import type { AccessPermission } from "@/features/rbac/schemas/rbac-schemas"

const actionLabels: Record<string, string> = {
  ALL: "Toàn quyền",
  CREATE: "Tạo mới",
  DELETE: "Xóa",
  READ: "Xem",
  SEND: "Gửi",
  TOGGLE_ACTIVE: "Bật / tắt",
  UPDATE: "Cập nhật",
}

export const actionSuffixes = [
  "TOGGLE_ACTIVE",
  "CREATE",
  "UPDATE",
  "DELETE",
  "READ",
  "SEND",
  "ALL",
] as const

export type PermissionGroup<T = AccessPermission> = {
  items: T[]
  resource: string
}

export function splitPermissionName(name: string) {
  const action = actionSuffixes.find((suffix) => name.endsWith(`_${suffix}`))

  if (!action) return { action: name, resource: name }

  return {
    action,
    resource: name.slice(0, -(action.length + 1)),
  }
}

export function getPermissionLabel(permission: AccessPermission) {
  const { action } = splitPermissionName(permission.name)
  return getActionLabel(action)
}

export function getActionLabel(action: string) {
  return actionLabels[action] ?? action
}

/**
 * A role holding `<RESOURCE>_ALL` is authorized for every action on that
 * resource at runtime (see DynamicAuthorizationManager on the backend, which
 * matches an "ALL" method permission against any HTTP method), even though
 * the role's stored permission rows don't literally include the other action
 * ids. Expand `permissionIds` so "ALL" and its implied siblings are always
 * treated as one unit on the client, instead of re-deriving this in every
 * place permissions are checked/rendered.
 */
export function expandImpliedPermissionIds<
  T extends { id: string; name: string },
>(permissionIds: string[], catalog: T[]): string[] {
  const ownedResourcesWithAll = new Set(
    catalog
      .filter((permission) => permissionIds.includes(permission.id))
      .map((permission) => splitPermissionName(permission.name))
      .filter(({ action }) => action === "ALL")
      .map(({ resource }) => resource)
  )
  if (ownedResourcesWithAll.size === 0) return permissionIds

  const impliedIds = catalog
    .filter((permission) => {
      const { action, resource } = splitPermissionName(permission.name)
      return action !== "ALL" && ownedResourcesWithAll.has(resource)
    })
    .map((permission) => permission.id)

  return Array.from(new Set([...permissionIds, ...impliedIds]))
}

/** Is this action implied/locked by an already-checked `<RESOURCE>_ALL`? */
export function isImpliedByAll(
  permission: { name: string },
  resourcesWithAllChecked: ReadonlySet<string>
): boolean {
  const { action, resource } = splitPermissionName(permission.name)
  return action !== "ALL" && resourcesWithAllChecked.has(resource)
}

export function getResourceLabel(resource: string) {
  if (resource === "SUPER_ADMIN") return "Quản trị toàn hệ thống"
  return getResourceTypeLabel(resource)
}

export function groupPermissions<
  T extends { id: string; name: string; isActive?: boolean },
>(permissions: T[], searchQuery: string): PermissionGroup<T>[] {
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase("vi")
  const groups = new Map<string, T[]>()

  permissions
    .filter((permission) => {
      if (permission.isActive === false) return false
      if (!normalizedSearch) return true

      const { action, resource } = splitPermissionName(permission.name)
      const searchable = [
        permission.name,
        getPermissionLabel(permission as unknown as AccessPermission),
        getResourceLabel(resource),
        action,
      ]
        .join(" ")
        .toLocaleLowerCase("vi")

      return searchable.includes(normalizedSearch)
    })
    .forEach((permission) => {
      const { resource } = splitPermissionName(permission.name)
      const current = groups.get(resource) ?? []
      current.push(permission)
      groups.set(resource, current)
    })

  return [...groups.entries()]
    .map(([resource, items]) => ({
      items: items.sort((left, right) => left.name.localeCompare(right.name)),
      resource,
    }))
    .sort((left, right) =>
      getResourceLabel(left.resource).localeCompare(
        getResourceLabel(right.resource),
        "vi"
      )
    )
}
