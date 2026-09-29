import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
  budgetAlertLogSchema,
  budgetAlertSettingSchema,
  budgetSchema,
  usageLogDetailSchema,
  usageLogPageSchema,
  usageLogSummarySchema,
  type Budget,
  type BudgetAlertLog,
  type BudgetAlertSetting,
  type CreateBudgetRequest,
  type UpdateBudgetAlertSettingRequest,
  type UpdateBudgetRequest,
  type UsageLogDetail,
  type UsageLogGroupBy,
  type UsageLogPage,
  type UsageLogSummary,
  type UsagePurpose,
  type UsageRequestStatus,
} from "@/features/cost-management/schemas/cost-management-schemas"
import { httpClient } from "@/lib/axios-client"
import { readSuccessData } from "@/utils/api-response"
import type { ApiResponse } from "@/utils/api-response"
import { z } from "zod"

export type UsageLogSummaryParams = {
  from: string
  groupBy: UsageLogGroupBy
  provider?: string
  purpose?: UsagePurpose
  to: string
}

export type UsageLogsParams = {
  from?: string
  // 1-based, like the rest of the UI (spring.data.web.pageable.one-indexed-parameters=true).
  limit: number
  page: number
  purpose?: UsagePurpose
  status?: UsageRequestStatus
  to?: string
}

export const costManagementApi = {
  async createBudget(input: CreateBudgetRequest): Promise<Budget> {
    const response = await httpClient.post<ApiResponse<Budget>>(
      API_ENDPOINTS.costManagement.budgets,
      input
    )
    return readSuccessData(response.data, budgetSchema)
  },

  async deleteBudget(budgetId: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.costManagement.budget(budgetId))
  },

  async dismissBudgetAlert(alertId: string): Promise<void> {
    await httpClient.post(
      API_ENDPOINTS.costManagement.budgetAlertDismiss(alertId)
    )
  },

  async getActiveBudgetAlerts(): Promise<BudgetAlertLog[]> {
    const response = await httpClient.get<ApiResponse<BudgetAlertLog[]>>(
      API_ENDPOINTS.costManagement.budgetAlertsActive
    )
    return readSuccessData(response.data, z.array(budgetAlertLogSchema))
  },

  async getBudgetAlertSettings(): Promise<BudgetAlertSetting> {
    const response = await httpClient.get<ApiResponse<BudgetAlertSetting>>(
      API_ENDPOINTS.costManagement.budgetAlertSettings
    )
    return readSuccessData(response.data, budgetAlertSettingSchema)
  },

  async getBudgetAlerts(): Promise<BudgetAlertLog[]> {
    const response = await httpClient.get<ApiResponse<BudgetAlertLog[]>>(
      API_ENDPOINTS.costManagement.budgetAlerts
    )
    return readSuccessData(response.data, z.array(budgetAlertLogSchema))
  },

  async getBudgets(): Promise<Budget[]> {
    const response = await httpClient.get<ApiResponse<Budget[]>>(
      API_ENDPOINTS.costManagement.budgets
    )
    return readSuccessData(response.data, z.array(budgetSchema))
  },

  async getUsageLog(usageLogId: string): Promise<UsageLogDetail> {
    const response = await httpClient.get<ApiResponse<UsageLogDetail>>(
      API_ENDPOINTS.costManagement.usageLog(usageLogId)
    )
    return readSuccessData(response.data, usageLogDetailSchema)
  },

  async getUsageLogSummary(
    params: UsageLogSummaryParams
  ): Promise<UsageLogSummary> {
    const response = await httpClient.get<ApiResponse<UsageLogSummary>>(
      API_ENDPOINTS.costManagement.usageLogSummary,
      { params }
    )
    return readSuccessData(response.data, usageLogSummarySchema)
  },

  async getUsageLogs(params: UsageLogsParams): Promise<UsageLogPage> {
    const response = await httpClient.get<ApiResponse<UsageLogPage>>(
      API_ENDPOINTS.costManagement.usageLogs,
      {
        params: {
          from: params.from || undefined,
          limit: params.limit,
          page: params.page,
          purpose: params.purpose,
          status: params.status,
          to: params.to || undefined,
        },
      }
    )
    return readSuccessData(response.data, usageLogPageSchema)
  },

  async updateBudget(
    budgetId: string,
    input: UpdateBudgetRequest
  ): Promise<Budget> {
    const response = await httpClient.put<ApiResponse<Budget>>(
      API_ENDPOINTS.costManagement.budget(budgetId),
      input
    )
    return readSuccessData(response.data, budgetSchema)
  },

  async updateBudgetAlertSettings(
    input: UpdateBudgetAlertSettingRequest
  ): Promise<BudgetAlertSetting> {
    const response = await httpClient.put<ApiResponse<BudgetAlertSetting>>(
      API_ENDPOINTS.costManagement.budgetAlertSettings,
      input
    )
    return readSuccessData(response.data, budgetAlertSettingSchema)
  },
}
