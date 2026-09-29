import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { usageLimitApi } from "@/features/usage-limits/api/usage-limit-api"
import { usageLimitKeys } from "@/features/usage-limits/queries/keys"

export const usageLimitOptions = {
  // Always refetched on mount: what is left changes with every chat turn.
  mine: () =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      // A guest or a hiccup should never toast: the meter simply stays hidden.
      meta: { suppressGlobalError: true },
      queryFn: () => usageLimitApi.getMyUsage(),
      queryKey: usageLimitKeys.mine(),
    }),
  plans: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => usageLimitApi.getPlans(),
      queryKey: usageLimitKeys.plans(),
    }),
  user: (userId: string) =>
    queryOptions({
      ...QUERY_POLICIES.detail,
      queryFn: () => usageLimitApi.getUserUsage(userId),
      queryKey: usageLimitKeys.user(userId),
    }),
}
