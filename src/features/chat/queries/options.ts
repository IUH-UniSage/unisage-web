import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { chatApi } from "@/features/chat/api/chat-api"
import { chatKeys } from "@/features/chat/queries/keys"

const PENDING_MESSAGE_STATUSES = new Set(["PENDING", "STREAMING"])
const MESSAGE_POLL_INTERVAL_MS = 1500

export const chatOptions = {
  conversations: (userId: string) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      enabled: Boolean(userId),
      queryFn: () => chatApi.getConversationsByUser(userId),
      queryKey: chatKeys.conversations(userId),
    }),
  messages: (conversationId: string) =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      enabled: Boolean(conversationId),
      queryFn: () => chatApi.getMessagesByConversation(conversationId),
      queryKey: chatKeys.messages(conversationId),
      refetchInterval: (query) => {
        const lastMessage = query.state.data?.at(-1)

        return lastMessage && PENDING_MESSAGE_STATUSES.has(lastMessage.status)
          ? MESSAGE_POLL_INTERVAL_MS
          : false
      },
    }),
}
