import { useMutation } from "@tanstack/react-query"

import { chatApi } from "@/features/chat/api/chat-api"
import { chatKeys } from "@/features/chat/queries/keys"
import type { CreateConversationRequest } from "@/features/chat/schemas/chat-schemas"

export function useCreateConversationMutation(userId: string) {
  return useMutation({
    meta: {
      invalidatesQuery: chatKeys.conversations(userId),
    },
    mutationFn: (input: CreateConversationRequest) =>
      chatApi.createConversation(input),
  })
}

export function useClaimConversationMutation(userId: string) {
  return useMutation({
    meta: {
      invalidatesQuery: chatKeys.conversations(userId),
      successMessage: "Đã khôi phục cuộc trò chuyện của bạn.",
    },
    mutationFn: (conversationId: string) =>
      chatApi.claimConversation(conversationId),
  })
}

export function useDeleteConversationMutation(userId: string) {
  return useMutation({
    meta: {
      invalidatesQuery: chatKeys.conversations(userId),
      successMessage: "Đã xóa cuộc trò chuyện.",
    },
    mutationFn: (conversationId: string) =>
      chatApi.softDeleteConversation(conversationId),
  })
}
