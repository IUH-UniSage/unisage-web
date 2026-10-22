import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { dashboardApi } from "@/features/analytics/api/dashboard-api"
import { dashboardKeys } from "@/features/analytics/queries/keys"
import type { DashboardPeriod } from "@/features/analytics/schemas/dashboard-schemas"

// "Today" moves every minute, so the dashboard is refetched on focus and every
// minute instead of following the 5-minute list policy.
const DASHBOARD_REFRESH_MS = 60_000

export const dashboardOptions = {
  summary: (period: DashboardPeriod) =>
    queryOptions({
      gcTime: 10 * 60 * 1000,
      placeholderData: keepPreviousData,
      queryFn: () => dashboardApi.getSummary(period),
      queryKey: dashboardKeys.summary(period),
      refetchInterval: DASHBOARD_REFRESH_MS,
      staleTime: DASHBOARD_REFRESH_MS,
    }),
}
