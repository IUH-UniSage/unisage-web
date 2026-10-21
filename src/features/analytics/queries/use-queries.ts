import { useQuery } from "@tanstack/react-query"

import { dashboardOptions } from "@/features/analytics/queries/options"
import type { DashboardPeriod } from "@/features/analytics/schemas/dashboard-schemas"

export function useDashboardSummaryQuery(period: DashboardPeriod) {
  return useQuery(dashboardOptions.summary(period))
}
