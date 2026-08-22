import { useQuery } from "@tanstack/react-query"

import { rbacOptions } from "@/features/rbac/queries/options"

export function useAccessPermissionsQuery() {
  return useQuery(rbacOptions.permissions())
}

export function useAccessRolesQuery() {
  return useQuery(rbacOptions.roles())
}
