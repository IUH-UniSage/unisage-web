import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { profileApi } from "@/features/profile/api/profile-api"
import { profileKeys } from "@/features/profile/queries/keys"

export const profileOptions = {
  me: () =>
    queryOptions({
      ...QUERY_POLICIES.detail,
      queryFn: () => profileApi.getMe(),
      queryKey: profileKeys.me(),
    }),
}
