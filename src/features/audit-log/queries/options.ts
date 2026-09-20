import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import {
  auditLogApi,
  type AuditLogsParams,
} from "@/features/audit-log/api/audit-log-api"
import { auditLogKeys } from "@/features/audit-log/queries/keys"

export const auditLogOptions = {
  list: (params: AuditLogsParams) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      placeholderData: keepPreviousData,
      queryFn: () => auditLogApi.getAuditLogs(params),
      queryKey: auditLogKeys.list(params),
    }),
}
