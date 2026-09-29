import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import {
  costManagementApi,
  type UsageLogSummaryParams,
  type UsageLogsParams,
} from "@/features/cost-management/api/cost-management-api"
import { costManagementKeys } from "@/features/cost-management/queries/keys"

export const costManagementOptions = {
  activeAlerts: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => costManagementApi.getActiveBudgetAlerts(),
      queryKey: costManagementKeys.activeAlerts(),
    }),

  alertSettings: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => costManagementApi.getBudgetAlertSettings(),
      queryKey: costManagementKeys.alertSettings(),
    }),

  alerts: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => costManagementApi.getBudgetAlerts(),
      queryKey: costManagementKeys.alerts(),
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
