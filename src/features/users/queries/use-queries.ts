import { useQuery } from "@tanstack/react-query"

import { userOptions } from "@/features/users/queries/options"

export function useUsersQuery() {
  return useQuery(userOptions.list())
}
