import { useQuery } from "@tanstack/react-query"

import { categoryOptions } from "@/features/categories/queries/options"

export function useCategoriesQuery() {
  return useQuery(categoryOptions.list())
}
