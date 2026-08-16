import { PERMISSIONS, type PermissionRequirement } from "@/lib/permissions"

const policy = (
  ...permissions: PermissionRequirement[]
): readonly PermissionRequirement[] => permissions

export const PERMISSION_POLICIES = {
  adminUsers: policy(PERMISSIONS.userRead),
  adminDocuments: policy(PERMISSIONS.documentRead),
  adminLogs: policy(
    PERMISSIONS.auditLogRead,
    PERMISSIONS.documentProcessLogRead,
    PERMISSIONS.llmTraceLogRead
  ),
  adminModels: policy(
    PERMISSIONS.embeddedModelRead,
    PERMISSIONS.chatbotConfigRead,
    PERMISSIONS.chatbotPoolRead
  ),
  adminHealth: policy(PERMISSIONS.superAdminAll),
  adminSettings: policy(PERMISSIONS.superAdminAll),
  ingesterOverview: policy(PERMISSIONS.ingestAll, PERMISSIONS.documentRead),
  ingesterDocuments: policy(PERMISSIONS.documentRead),
  ingesterProcessing: policy(
    PERMISSIONS.ingestAll,
    PERMISSIONS.documentProcessLogRead
  ),
  ingesterQuality: policy(
    PERMISSIONS.documentRead,
    PERMISSIONS.documentChunkRead
  ),
  ingesterSettings: policy(PERMISSIONS.embeddedModelRead),
  uploadDocument: policy(PERMISSIONS.ingestAll, PERMISSIONS.documentCreate),
} as const
