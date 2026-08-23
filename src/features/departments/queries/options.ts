import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { departmentApi } from "@/features/departments/api/department-api"
import { departmentKeys } from "@/features/departments/queries/keys"

export const departmentOptions = {
  list: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => departmentApi.getDepartments(),
      queryKey: departmentKeys.list(),
    }),
}
