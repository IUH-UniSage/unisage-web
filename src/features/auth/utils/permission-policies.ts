import { PERMISSIONS, type PermissionRequirement } from "@/utils/permissions"

const policy = (
  ...permissions: PermissionRequirement[]
): readonly PermissionRequirement[] => permissions

export const PERMISSION_POLICIES = {
  adminAccessLevels: policy(PERMISSIONS.accessLevelRead),
  adminDepartments: policy(PERMISSIONS.departmentRead),
  adminUsers: policy(PERMISSIONS.userRead),
  adminDocuments: policy(PERMISSIONS.documentRead),
  adminLogs: policy(PERMISSIONS.auditLogRead, PERMISSIONS.llmTraceLogRead),
  adminModels: policy(PERMISSIONS.superAdminAll),
  adminHealth: policy(PERMISSIONS.superAdminAll),
  adminRbac: policy(PERMISSIONS.roleRead, PERMISSIONS.permissionRead),
  adminSettings: policy(PERMISSIONS.superAdminAll),
  ingesterOverview: policy(PERMISSIONS.ingestAll, PERMISSIONS.documentRead),
  ingesterDocuments: policy(PERMISSIONS.documentRead),
  ingesterProcessing: policy(PERMISSIONS.ingestAll),
  ingesterQuality: policy(PERMISSIONS.documentRead),
  ingesterSettings: policy(PERMISSIONS.superAdminAll),
  uploadDocument: policy(PERMISSIONS.ingestAll, PERMISSIONS.documentCreate),
} as const
