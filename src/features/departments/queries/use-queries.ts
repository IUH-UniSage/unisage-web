import { useQuery } from "@tanstack/react-query"

import { departmentOptions } from "@/features/departments/queries/options"

export function useDepartmentsQuery() {
  return useQuery(departmentOptions.list())
}

export function useDepartmentAccessSuggestionQuery(
  parentId: string | null | undefined,
  userId: string | null | undefined
) {
  return useQuery(departmentOptions.accessSuggestion(parentId, userId))
}
