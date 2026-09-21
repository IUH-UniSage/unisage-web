import { useQuery } from "@tanstack/react-query"

import { usageLimitOptions } from "@/features/usage-limits/queries/options"

export function useMyUsageQuery() {
  return useQuery(usageLimitOptions.mine())
}

export function useUsageLimitPlansQuery(options?: { enabled?: boolean }) {
  return useQuery({ ...usageLimitOptions.plans(), enabled: options?.enabled })
}
