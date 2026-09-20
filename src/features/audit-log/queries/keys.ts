import type { AuditLogsParams } from "@/features/audit-log/api/audit-log-api"

export const auditLogKeys = {
  all: ["audit-logs"] as const,
  list: (params: AuditLogsParams) =>
    [...auditLogKeys.all, "list", params] as const,
}
