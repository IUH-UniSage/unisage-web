import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { chatApi } from "@/features/chat/api/chat-api"
import { chatKeys } from "@/features/chat/queries/keys"

export const chatOptions = {
  // Guests (userId === "") have no user to scope by - their history is resolved
  // server-side from the guest_session_id httpOnly cookie instead (see
  // GET /conversations/guest), so the query is never disabled here.
  conversations: (userId: string) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () =>
        userId
          ? chatApi.getConversationsByUser(userId)
          : chatApi.getGuestConversations(),
      queryKey: chatKeys.conversations(userId),
    }),
  // The assistant reply's text is driven live by `useChatStream` (SSE) via
  // direct cache writes, not by polling - refetching here only happens once
  // on `onDone`/`stopGenerating` to reconcile with backend-java's persisted
  // state (real ids/timestamps). Overrides the shared `realtime` policy's
  // `staleTime: 0`: that setting refetches on every mount regardless of how
  // fresh the cache already is, which would otherwise race an in-progress
  // stream's optimistic cache writes with a server response still showing
  // the assistant row as empty/STREAMING (or not created yet) and clobber
  // it. `invalidateQueries` (called explicitly on done/stop/error) always
  // forces a refetch regardless of `staleTime`, so reconciliation still
  // happens at the right moments.
  messages: (conversationId: string) =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      enabled: Boolean(conversationId),
      queryFn: () => chatApi.getMessagesByConversation(conversationId),
      queryKey: chatKeys.messages(conversationId),
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }),
}
