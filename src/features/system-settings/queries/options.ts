import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { systemConfigApi } from "@/features/system-settings/api/system-config-api"
import { systemConfigKeys } from "@/features/system-settings/queries/keys"

// One query for the whole list (11 rows total), client-filtered per category
// tab in the dashboard - avoids firing 6 separate requests on page load for
// what's a single small table.
export const systemConfigOptions = {
  list: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => systemConfigApi.getSystemConfigs(),
      queryKey: systemConfigKeys.list(),
    }),
}
