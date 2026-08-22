import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { rbacApi } from "@/features/rbac/api/rbac-api"
import { rbacKeys } from "@/features/rbac/queries/keys"

export const rbacOptions = {
  permissions: () =>
    queryOptions({
      ...QUERY_POLICIES.static,
      queryFn: () => rbacApi.getPermissions(),
      queryKey: rbacKeys.permissions(),
    }),
  roles: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => rbacApi.getRoles(),
      queryKey: rbacKeys.roles(),
    }),
}
