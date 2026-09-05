import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { departmentApi } from "@/features/departments/api/department-api"
import { departmentKeys } from "@/features/departments/queries/keys"

export const departmentOptions = {
  accessSuggestion: (
    parentId: string | null | undefined,
    userId: string | null | undefined
  ) =>
    queryOptions({
      ...QUERY_POLICIES.detail,
      enabled: Boolean(parentId && userId),
      meta: { suppressGlobalError: true },
      queryFn: () =>
        departmentApi.getAccessSuggestion(parentId as string, userId as string),
      queryKey: departmentKeys.accessSuggestion(parentId ?? "", userId ?? ""),
    }),
  list: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => departmentApi.getDepartments(),
      queryKey: departmentKeys.list(),
    }),
}
