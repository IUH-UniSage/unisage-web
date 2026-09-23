import { useQuery } from "@tanstack/react-query"

import { dashboardOptions } from "@/features/analytics/queries/options"

export function useDashboardSummaryQuery() {
  return useQuery(dashboardOptions.summary())
}
