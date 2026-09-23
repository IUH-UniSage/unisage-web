import type { PermissionInfo } from "@/features/auth/schemas/auth-schemas"

export const PERMISSIONS = {
  superAdminAll: "SUPER_ADMIN_ALL",
  userAll: "USER_ALL",
  userRead: "USER_READ",
  userCreate: "USER_CREATE",
  userUpdate: "USER_UPDATE",
  userDelete: "USER_DELETE",
  roleAll: "ROLE_ALL",
  roleRead: "ROLE_READ",
  roleCreate: "ROLE_CREATE",
  roleUpdate: "ROLE_UPDATE",
  roleDelete: "ROLE_DELETE",
  permissionAll: "PERMISSION_ALL",
  permissionRead: "PERMISSION_READ",
  permissionCreate: "PERMISSION_CREATE",
  permissionUpdate: "PERMISSION_UPDATE",
  permissionDelete: "PERMISSION_DELETE",
  categoryAll: "CATEGORY_ALL",
  categoryRead: "CATEGORY_READ",
  categoryCreate: "CATEGORY_CREATE",
  categoryUpdate: "CATEGORY_UPDATE",
  categoryDelete: "CATEGORY_DELETE",
  accessLevelAll: "ACCESS_LEVEL_ALL",
  accessLevelRead: "ACCESS_LEVEL_READ",
  accessLevelCreate: "ACCESS_LEVEL_CREATE",
  accessLevelUpdate: "ACCESS_LEVEL_UPDATE",
  accessLevelDelete: "ACCESS_LEVEL_DELETE",
  departmentAll: "DEPARTMENT_ALL",
  departmentRead: "DEPARTMENT_READ",
  departmentCreate: "DEPARTMENT_CREATE",
  departmentUpdate: "DEPARTMENT_UPDATE",
  departmentDelete: "DEPARTMENT_DELETE",
  documentAll: "DOCUMENT_ALL",
  documentRead: "DOCUMENT_READ",
  documentCreate: "DOCUMENT_CREATE",
  documentUpdate: "DOCUMENT_UPDATE",
  documentDelete: "DOCUMENT_DELETE",
  chatModelAll: "CHAT_MODEL_ALL",
  chatModelRead: "CHAT_MODEL_READ",
  chatModelCreate: "CHAT_MODEL_CREATE",
  chatModelUpdate: "CHAT_MODEL_UPDATE",
  chatModelDelete: "CHAT_MODEL_DELETE",
  conversationAll: "CONVERSATION_ALL",
  conversationRead: "CONVERSATION_READ",
  conversationCreate: "CONVERSATION_CREATE",
  conversationDelete: "CONVERSATION_DELETE",
  usageLimitPlanAll: "USAGE_LIMIT_PLAN_ALL",
  usageLimitPlanRead: "USAGE_LIMIT_PLAN_READ",
  usageLimitPlanCreate: "USAGE_LIMIT_PLAN_CREATE",
  usageLimitPlanUpdate: "USAGE_LIMIT_PLAN_UPDATE",
  usageLimitPlanDelete: "USAGE_LIMIT_PLAN_DELETE",
  ticketAll: "TICKET_ALL",
  ticketRead: "TICKET_READ",
  ticketCreate: "TICKET_CREATE",
  ticketUpdate: "TICKET_UPDATE",
  ticketDelete: "TICKET_DELETE",
  messageAll: "MESSAGE_ALL",
  messageRead: "MESSAGE_READ",
  messageSend: "MESSAGE_SEND",
  auditLogAll: "AUDIT_LOG_ALL",
  auditLogRead: "AUDIT_LOG_READ",
  llmTraceLogAll: "LLM_TRACE_LOG_ALL",
  llmTraceLogRead: "LLM_TRACE_LOG_READ",
  // UNISAGE-64/65: read-only listing + update-existing-value only - no
  // create/delete permission, new keys are added via backend migration, not
  // through the UI (see system-settings feature).
  systemConfigAll: "SYSTEM_CONFIG_ALL",
  systemConfigRead: "SYSTEM_CONFIG_READ",
  systemConfigUpdate: "SYSTEM_CONFIG_UPDATE",
  // UNISAGE-63: read-only status dashboard - no update/create/delete
  // permission exists because there's nothing to edit on this page (see
  // system-health feature).
  systemHealthRead: "SYSTEM_HEALTH_READ",
  dashboardRead: "DASHBOARD_READ",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// Canonical resource names that map to backend permission conventions.
// Adding a new resource here automatically makes it usable with useResourcePermissions().
export type ResourceName =
  | "user"
  | "role"
  | "permission"
  | "category"
  | "access_level"
  | "department"
  | "document"
  | "chat_model"
  | "conversation"
  | "message"
  | "ticket"
  | "usage_limit_plan"
  | "audit_log"
  | "llm_trace_log"
  | "system_config"
  | "system_health"
  | "super_admin"

export type PermissionRequirement =
  | Permission
  | {
      minimumAccessLevel?: number
      name: Permission
    }

const actionSuffixes = [
  "_READ",
  "_CREATE",
  "_UPDATE",
  "_DELETE",
  "_SEND",
] as const

function getRequirement(requirement: PermissionRequirement) {
  return typeof requirement === "string" ? { name: requirement } : requirement
}

function getResourceWildcard(permission: Permission): Permission | null {
  const suffix = actionSuffixes.find((candidate) =>
    permission.endsWith(candidate)
  )

  if (!suffix) return null

  return `${permission.slice(0, -suffix.length)}_ALL` as Permission
}

export function hasPermission(
  grantedPermissions: readonly string[],
  requiredPermission: Permission
) {
  const resourceWildcard = getResourceWildcard(requiredPermission)

  return (
    grantedPermissions.includes(PERMISSIONS.superAdminAll) ||
    grantedPermissions.includes(requiredPermission) ||
    (resourceWildcard !== null && grantedPermissions.includes(resourceWildcard))
  )
}

export function hasEveryPermission(
  grantedPermissions: readonly string[],
  requiredPermissions: readonly Permission[]
) {
  return requiredPermissions.every((permission) =>
    hasPermission(grantedPermissions, permission)
  )
}

export function hasAnyPermission(
  grantedPermissions: readonly string[],
  requiredPermissions: readonly Permission[]
) {
  return requiredPermissions.some((permission) =>
    hasPermission(grantedPermissions, permission)
  )
}

export function hasPermissionInfo(
  grantedPermissions: readonly PermissionInfo[],
  requirement: PermissionRequirement
) {
  const { minimumAccessLevel, name } = getRequirement(requirement)
  const resourceWildcard = getResourceWildcard(name)

  return grantedPermissions.some((permission) => {
    const nameMatches =
      permission.name === PERMISSIONS.superAdminAll ||
      permission.name === name ||
      (resourceWildcard !== null && permission.name === resourceWildcard)

    if (!nameMatches) return false
    if (minimumAccessLevel === undefined) return true

    return (
      permission.accessLevel === null ||
      permission.accessLevel === undefined ||
      permission.accessLevel >= minimumAccessLevel
    )
  })
}

export function hasEveryPermissionInfo(
  grantedPermissions: readonly PermissionInfo[],
  requiredPermissions: readonly PermissionRequirement[]
) {
  return requiredPermissions.every((permission) =>
    hasPermissionInfo(grantedPermissions, permission)
  )
}

export function hasAnyPermissionInfo(
  grantedPermissions: readonly PermissionInfo[],
  requiredPermissions: readonly PermissionRequirement[]
) {
  return requiredPermissions.some((permission) =>
    hasPermissionInfo(grantedPermissions, permission)
  )
}
