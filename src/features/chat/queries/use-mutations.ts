import { useMutation, useQueryClient } from "@tanstack/react-query"

import { chatApi } from "@/features/chat/api/chat-api"
import { chatKeys } from "@/features/chat/queries/keys"
import type {
  CreateConversationRequest,
  SendMessageRequest,
} from "@/features/chat/schemas/chat-schemas"

export function useCreateConversationMutation(userId: string) {
  return useMutation({
    meta: {
      invalidatesQuery: chatKeys.conversations(userId),
    },
    mutationFn: (input: CreateConversationRequest) =>
      chatApi.createConversation(input),
  })
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SendMessageRequest) => chatApi.sendMessage(input),
    onSuccess: (newMessage, variables) => {
      queryClient.setQueryData(
        chatKeys.messages(variables.conversationId),
        (
          current:
            | Awaited<ReturnType<typeof chatApi.getMessagesByConversation>>
            | undefined
        ) => (current ? [...current, newMessage] : [newMessage])
      )
      // Refetch right away so a backend-generated assistant reply (still
      // PENDING/STREAMING) is picked up and the poll in chatOptions.messages
      // takes over from there.
      void queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.conversationId),
      })
    },
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
