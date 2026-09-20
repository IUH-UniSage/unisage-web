import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import {
  systemHealthApi,
  type SystemHealthHistoryParams,
} from "@/features/system-health/api/system-health-api"
import { systemHealthKeys } from "@/features/system-health/queries/keys"

// Live status polls every 15s via refetchInterval below - `realtime`'s
// staleTime: 0 makes every poll (and every refocus/reconnect) count as
// fresh data rather than serving a stale cache hit, which matters here
// since a component flipping DOWN should show up on the next poll, not
// linger behind a stale-time window the way admin CRUD lists intentionally
// do.
const LIVE_REFETCH_INTERVAL_MS = 15_000

export const systemHealthOptions = {
  history: (params: SystemHealthHistoryParams) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      placeholderData: keepPreviousData,
      queryFn: () => systemHealthApi.getHealthHistory(params),
      queryKey: systemHealthKeys.history(params),
    }),

  live: () =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      queryFn: () => systemHealthApi.getHealth(),
      queryKey: systemHealthKeys.live(),
      refetchInterval: LIVE_REFETCH_INTERVAL_MS,
      // Keep polling even when the health check itself is failing (a
      // network error reaching the backend) - that's the one signal this
      // page exists to surface, so a failed poll must not stop future
      // polls the way it would for a normal query.
      retry: false,
    }),
}
