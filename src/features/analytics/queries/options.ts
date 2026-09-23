import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { dashboardApi } from "@/features/analytics/api/dashboard-api"
import { dashboardKeys } from "@/features/analytics/queries/keys"

export const dashboardOptions = {
  summary: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => dashboardApi.getSummary(),
      queryKey: dashboardKeys.summary(),
    }),
}
