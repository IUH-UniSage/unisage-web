import {
  auditLogPageSchema,
  type AuditAction,
  type AuditLogPage,
} from "@/features/audit-log/schemas/audit-log-schemas"
import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { readSuccessData } from "@/utils/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/utils/api-response"

export type AuditLogsParams = {
  action?: AuditAction
  // The human-readable code (e.g. "SA-001"), not the actorId UUID - see
  // audit-log-list.tsx's Filters type for why.
  actorCode?: string
  fromDate?: string
  // 1-based, like the rest of the UI.
  page: number
  limit: number
  resourceType?: string
  toDate?: string
}

export const auditLogApi = {
  async getAuditLogs(params: AuditLogsParams): Promise<AuditLogPage> {
    const response = await httpClient.get<ApiResponse<AuditLogPage>>(
      API_ENDPOINTS.auditLogs.auditLogs,
      {
        params: {
          action: params.action,
          actorCode: params.actorCode || undefined,
          fromDate: params.fromDate || undefined,
          limit: params.limit,
          page: params.page,
          resourceType: params.resourceType,
          toDate: params.toDate || undefined,
        },
      }
    )

    return readSuccessData(response.data, auditLogPageSchema)
  },
}
