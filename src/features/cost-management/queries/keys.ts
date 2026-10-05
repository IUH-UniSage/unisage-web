import type {
  BudgetAlertsParams,
  ModelPriceHistoryParams,
  UsageLogSummaryParams,
  UsageLogsParams,
} from "@/features/cost-management/api/cost-management-api"

export const costManagementKeys = {
  activeAlerts: () => [...costManagementKeys.all, "active-alerts"] as const,
  alertSettings: () => [...costManagementKeys.all, "alert-settings"] as const,
  alerts: (params: BudgetAlertsParams) =>
    [...costManagementKeys.all, "alerts", params] as const,
  all: ["cost-management"] as const,
  budgets: () => [...costManagementKeys.all, "budgets"] as const,
  modelPriceHistory: (params: ModelPriceHistoryParams) =>
    [...costManagementKeys.modelPricing(), "history", params] as const,
  modelPrices: () => [...costManagementKeys.modelPricing(), "prices"] as const,
  modelPricing: () => [...costManagementKeys.all, "model-pricing"] as const,
  usageLog: (usageLogId: string) =>
    [...costManagementKeys.all, "usage-log", usageLogId] as const,
  usageLogSummaries: () =>
    [...costManagementKeys.all, "usage-log-summary"] as const,
  usageLogSummary: (params: UsageLogSummaryParams) =>
    [...costManagementKeys.usageLogSummaries(), params] as const,
  usageLogs: (params: UsageLogsParams) =>
    [...costManagementKeys.usageLogsAll(), params] as const,
  usageLogsAll: () => [...costManagementKeys.all, "usage-logs"] as const,
}
