import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { accessControlApi } from "@/features/access-control/api/access-control-api"
import { accessControlKeys } from "@/features/access-control/queries/keys"

export const accessControlOptions = {
  permissions: () =>
    queryOptions({
      ...QUERY_POLICIES.static,
      queryFn: () => accessControlApi.getPermissions(),
      queryKey: accessControlKeys.permissions(),
    }),
  roles: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => accessControlApi.getRoles(),
      queryKey: accessControlKeys.roles(),
    }),
}
