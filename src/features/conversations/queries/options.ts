import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import {
  shareApi,
  type MySharesParams,
} from "@/features/conversations/api/share-api"
import { shareKeys } from "@/features/conversations/queries/keys"
import { isShareNotFound } from "@/features/conversations/utils/share-errors"

export const shareOptions = {
  mine: (params: MySharesParams) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      placeholderData: keepPreviousData,
      queryFn: () => shareApi.getMyShares(params),
      queryKey: shareKeys.mine(params),
      // The page shows its own Vietnamese error state.
      meta: { suppressGlobalError: true },
    }),
  // A snapshot never changes once created; only revocation ends it.
  view: (token: string) =>
    queryOptions({
      ...QUERY_POLICIES.detail,
      enabled: Boolean(token),
      queryFn: () => shareApi.getSharedConversation(token),
      queryKey: shareKeys.view(token),
      // A missing/revoked link is a normal outcome, not worth a retry.
      retry: (failureCount, error) =>
        !isShareNotFound(error) && failureCount < 1,
      // The page renders its own empty/error states.
      meta: { suppressGlobalError: true },
    }),
}
