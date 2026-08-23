import { useQuery } from "@tanstack/react-query"

import { departmentOptions } from "@/features/departments/queries/options"

export function useDepartmentsQuery() {
  return useQuery(departmentOptions.list())
}
