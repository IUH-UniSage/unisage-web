import { useQuery } from "@tanstack/react-query"

import { chatOptions } from "@/features/chat/queries/options"

export function useConversationsQuery(userId: string) {
  return useQuery(chatOptions.conversations(userId))
}

export function useMessagesQuery(conversationId: string) {
  return useQuery(chatOptions.messages(conversationId))
}
