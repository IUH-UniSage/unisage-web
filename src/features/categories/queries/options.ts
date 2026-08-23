import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { categoryApi } from "@/features/categories/api/category-api"
import { categoryKeys } from "@/features/categories/queries/keys"

export const categoryOptions = {
  list: () =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => categoryApi.getCategories(),
      queryKey: categoryKeys.list(),
    }),
}
