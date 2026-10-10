import { useMutation, useQueryClient } from "@tanstack/react-query"

import { chatApi } from "@/features/chat/api/chat-api"
import { chatKeys } from "@/features/chat/queries/keys"
import type { CalculationFeedbackRequest } from "@/features/chat/schemas/calculation-schemas"
import type {
  CreateConversationRequest,
  Message,
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

/**
 * Đúng/Sai on one AI-computed calculation result (contract §5b). On success the
 * verdict is written into the cached message's `metadata.calculation_feedback`
 * - the same field the backend persists - so it survives a reload unchanged.
 * Errors are handled by the caller (a 409 locks the buttons instead of a
 * generic toast).
 */
export function useCalculationFeedbackMutation(
  conversationId: string,
  messageId: string
) {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { suppressGlobalError: true },
    mutationFn: (input: CalculationFeedbackRequest) =>
      chatApi.submitCalculationFeedback(messageId, input),
    onSuccess: (result) => {
      queryClient.setQueryData(
        chatKeys.messages(conversationId),
        (current: Message[] | undefined) =>
          current?.map((message) => {
            if (message.id !== messageId) return message
            const previous = message.metadata?.calculation_feedback
            const feedback =
              previous && typeof previous === "object" ? previous : {}
            return {
              ...message,
              metadata: {
                ...message.metadata,
                calculation_feedback: {
                  ...feedback,
                  [result.itemId]: {
                    at: new Date().toISOString(),
                    reason: result.reason,
                    verdict: result.verdict,
                  },
                },
              },
            }
          })
      )
    },
  })
}
