import { useQuery } from "@tanstack/react-query"

import type {
  UsageLogSummaryParams,
  UsageLogsParams,
} from "@/features/cost-management/api/cost-management-api"
import { costManagementOptions } from "@/features/cost-management/queries/options"

export function useActiveBudgetAlertsQuery() {
  return useQuery(costManagementOptions.activeAlerts())
}

export function useBudgetAlertSettingsQuery() {
  return useQuery(costManagementOptions.alertSettings())
}

export function useBudgetAlertsQuery() {
  return useQuery(costManagementOptions.alerts())
}

export function useBudgetsQuery() {
  return useQuery(costManagementOptions.budgets())
}

export function useUsageLogQuery(usageLogId: string) {
  return useQuery(costManagementOptions.usageLog(usageLogId))
}

export function useUsageLogSummaryQuery(params: UsageLogSummaryParams) {
  return useQuery(costManagementOptions.usageLogSummary(params))
}

export function useUsageLogsQuery(params: UsageLogsParams) {
  return useQuery(costManagementOptions.usageLogs(params))
}
