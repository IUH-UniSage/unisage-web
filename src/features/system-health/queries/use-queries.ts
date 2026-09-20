import { useQuery } from "@tanstack/react-query"

import type { SystemHealthHistoryParams } from "@/features/system-health/api/system-health-api"
import { systemHealthOptions } from "@/features/system-health/queries/options"

export function useSystemHealthLiveQuery() {
  return useQuery(systemHealthOptions.live())
}

export function useSystemHealthHistoryQuery(params: SystemHealthHistoryParams) {
  return useQuery(systemHealthOptions.history(params))
}
