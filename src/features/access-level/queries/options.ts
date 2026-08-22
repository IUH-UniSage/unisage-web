import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { accessLevelApi } from "@/features/access-level/api/access-level-api"
import { accessLevelKeys } from "@/features/access-level/queries/keys"

export const accessLevelOptions = {
  list: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => accessLevelApi.getAccessLevels(),
      queryKey: accessLevelKeys.list(),
    }),
}
