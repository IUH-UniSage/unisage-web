import type {
  BudgetAlertsParams,
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
  usageLog: (usageLogId: string) =>
    [...costManagementKeys.all, "usage-log", usageLogId] as const,
  usageLogSummary: (params: UsageLogSummaryParams) =>
    [...costManagementKeys.all, "usage-log-summary", params] as const,
  usageLogs: (params: UsageLogsParams) =>
    [...costManagementKeys.all, "usage-logs", params] as const,
}
