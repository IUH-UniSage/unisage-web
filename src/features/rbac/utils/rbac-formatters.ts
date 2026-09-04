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

const actionSuffixes = [
  "TOGGLE_ACTIVE",
  "CREATE",
  "UPDATE",
  "DELETE",
  "READ",
  "SEND",
  "ALL",
] as const

export type PermissionGroup = {
  items: AccessPermission[]
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
  return actionLabels[action] ?? action
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
