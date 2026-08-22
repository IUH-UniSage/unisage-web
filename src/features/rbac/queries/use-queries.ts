import { useQuery } from "@tanstack/react-query"

import { accessControlOptions } from "@/features/access-control/queries/options"

export function useAccessPermissionsQuery() {
  return useQuery(accessControlOptions.permissions())
}

export function useAccessRolesQuery() {
  return useQuery(accessControlOptions.roles())
}
