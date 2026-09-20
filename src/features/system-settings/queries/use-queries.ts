import { useQuery } from "@tanstack/react-query"

import { systemConfigOptions } from "@/features/system-settings/queries/options"

export function useSystemConfigsQuery() {
  return useQuery(systemConfigOptions.list())
}
