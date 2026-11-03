import { useQuery } from "@tanstack/react-query"

import type { MySharesParams } from "@/features/conversations/api/share-api"
import { shareOptions } from "@/features/conversations/queries/options"

export function useMySharesQuery(params: MySharesParams) {
  return useQuery(shareOptions.mine(params))
}

export function useSharedConversationQuery(token: string) {
  return useQuery(shareOptions.view(token))
}
