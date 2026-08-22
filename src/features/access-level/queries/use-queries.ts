import { useQuery } from "@tanstack/react-query"

import { accessLevelOptions } from "@/features/access-level/queries/options"

export function useAccessLevelsQuery() {
  return useQuery(accessLevelOptions.list())
}
