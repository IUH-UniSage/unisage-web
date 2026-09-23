import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
  dashboardSummarySchema,
  type DashboardSummary,
} from "@/features/analytics/schemas/dashboard-schemas"
import { httpClient } from "@/lib/axios-client"
import { readSuccessData } from "@/utils/api-response"
import type { ApiResponse } from "@/utils/api-response"

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await httpClient.get<ApiResponse<DashboardSummary>>(
      API_ENDPOINTS.dashboard.summary
    )

    return readSuccessData(response.data, dashboardSummarySchema)
  },
}
