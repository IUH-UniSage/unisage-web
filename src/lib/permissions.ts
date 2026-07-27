export const PERMISSIONS = {
  accessControlManage: "access-control:manage",
  analyticsRead: "analytics:read",
  auditLogRead: "audit-log:read",
  documentsIngest: "documents:ingest",
  documentsManage: "documents:manage",
  knowledgeRead: "knowledge:read",
  modelsManage: "models:manage",
  systemHealthRead: "system-health:read",
  systemSettingsManage: "system-settings:manage",
  ticketsManage: "tickets:manage",
  usersManage: "users:manage",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export function hasPermission(
  grantedPermissions: readonly Permission[],
  permission: Permission
) {
  return grantedPermissions.includes(permission)
}

export function hasEveryPermission(
  grantedPermissions: readonly Permission[],
  requiredPermissions: readonly Permission[]
) {
  return requiredPermissions.every((permission) =>
    hasPermission(grantedPermissions, permission)
  )
}

export function hasAnyPermission(
  grantedPermissions: readonly Permission[],
  requiredPermissions: readonly Permission[]
) {
  return requiredPermissions.some((permission) =>
    hasPermission(grantedPermissions, permission)
  )
}
