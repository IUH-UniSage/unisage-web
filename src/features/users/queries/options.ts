import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { userApi } from "@/features/users/api/user-api"
import { userKeys } from "@/features/users/queries/keys"

export const userOptions = {
  list: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => userApi.getUsers(),
      queryKey: userKeys.list(),
    }),
}
