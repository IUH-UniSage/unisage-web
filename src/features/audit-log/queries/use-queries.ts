import { useQuery } from "@tanstack/react-query"

import type { AuditLogsParams } from "@/features/audit-log/api/audit-log-api"
import { auditLogOptions } from "@/features/audit-log/queries/options"

export function useAuditLogsQuery(params: AuditLogsParams) {
  return useQuery(auditLogOptions.list(params))
}
