import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import {
  costManagementApi,
  type BudgetAlertsParams,
  type UsageLogSummaryParams,
  type UsageLogsParams,
} from "@/features/cost-management/api/cost-management-api"
import { costManagementKeys } from "@/features/cost-management/queries/keys"

// Polled by BudgetAlertBanner so a new alert (or another admin's dismiss)
// shows up without a manual refresh.
const ACTIVE_ALERTS_POLL_INTERVAL_MS = 60_000

export const costManagementOptions = {
  activeAlerts: () =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      queryFn: () => costManagementApi.getActiveBudgetAlerts(),
      queryKey: costManagementKeys.activeAlerts(),
      refetchInterval: ACTIVE_ALERTS_POLL_INTERVAL_MS,
    }),

  alertSettings: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => costManagementApi.getBudgetAlertSettings(),
      queryKey: costManagementKeys.alertSettings(),
    }),

  alerts: (params: BudgetAlertsParams) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      placeholderData: keepPreviousData,
      queryFn: () => costManagementApi.getBudgetAlerts(params),
      queryKey: costManagementKeys.alerts(params),
    }),

  budgets: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => costManagementApi.getBudgets(),
      queryKey: costManagementKeys.budgets(),
    }),

  usageLog: (usageLogId: string) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      enabled: Boolean(usageLogId),
      queryFn: () => costManagementApi.getUsageLog(usageLogId),
      queryKey: costManagementKeys.usageLog(usageLogId),
    }),

  usageLogSummary: (params: UsageLogSummaryParams) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      placeholderData: keepPreviousData,
      queryFn: () => costManagementApi.getUsageLogSummary(params),
      queryKey: costManagementKeys.usageLogSummary(params),
    }),

  usageLogs: (params: UsageLogsParams) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      placeholderData: keepPreviousData,
      queryFn: () => costManagementApi.getUsageLogs(params),
      queryKey: costManagementKeys.usageLogs(params),
    }),
}
