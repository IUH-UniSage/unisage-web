import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
  healthCheckResponseSchema,
  healthHistoryPageSchema,
  type HealthCheckResponse,
  type HealthHistoryPage,
} from "@/features/system-health/schemas/system-health-schemas"
import { httpClient } from "@/lib/axios-client"
import { readSuccessData } from "@/utils/api-response"
import type { ApiResponse } from "@/utils/api-response"

export type SystemHealthHistoryParams = {
  fromDate?: string
  // 1-based, like the rest of the UI (see audit-log-api.ts's same
  // convention for `page`).
  limit: number
  page: number
  toDate?: string
}

export const systemHealthApi = {
  async getHealth(): Promise<HealthCheckResponse> {
    const response = await httpClient.get<ApiResponse<HealthCheckResponse>>(
      API_ENDPOINTS.systemHealth.health
    )

    return readSuccessData(response.data, healthCheckResponseSchema)
  },

  async getHealthHistory(
    params: SystemHealthHistoryParams
  ): Promise<HealthHistoryPage> {
    const response = await httpClient.get<ApiResponse<HealthHistoryPage>>(
      API_ENDPOINTS.systemHealth.history,
      {
        params: {
          from: params.fromDate || undefined,
          limit: params.limit,
          page: params.page,
          to: params.toDate || undefined,
        },
      }
    )

    return readSuccessData(response.data, healthHistoryPageSchema)
  },
}
