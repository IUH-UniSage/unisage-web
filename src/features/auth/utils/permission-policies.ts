import { PERMISSIONS, type PermissionRequirement } from "@/utils/permissions"

const policy = (
  ...permissions: PermissionRequirement[]
): readonly PermissionRequirement[] => permissions

export const PERMISSION_POLICIES = {
  // Shared across every workspace a feature is registered in
  // (feature-registry.tsx) - one permission, not a per-workspace name,
  // because the backend permission itself doesn't vary by which staff
  // workspace the user reached the feature from.
  categories: policy(PERMISSIONS.categoryRead),
  departments: policy(PERMISSIONS.departmentRead),
  documents: policy(PERMISSIONS.documentRead),

  adminAccessLevels: policy(PERMISSIONS.accessLevelRead),
  adminUsers: policy(PERMISSIONS.userRead),
  adminLogs: policy(PERMISSIONS.auditLogRead, PERMISSIONS.llmTraceLogRead),
  adminModels: policy(PERMISSIONS.chatModelRead),
  adminHealth: policy(PERMISSIONS.superAdminAll),
  adminRbac: policy(PERMISSIONS.roleRead, PERMISSIONS.permissionRead),
  adminSettings: policy(PERMISSIONS.superAdminAll),
  ingesterOverview: policy(PERMISSIONS.ingestAll, PERMISSIONS.documentRead),
  ingesterProcessing: policy(PERMISSIONS.ingestAll),
  ingesterQuality: policy(PERMISSIONS.documentRead),
  ingesterSettings: policy(PERMISSIONS.superAdminAll),
  uploadDocument: policy(PERMISSIONS.ingestAll, PERMISSIONS.documentCreate),
} as const
