import { useQuery } from "@tanstack/react-query"

import { profileOptions } from "@/features/profile/queries/options"

export function useMyProfileQuery() {
  return useQuery(profileOptions.me())
}
