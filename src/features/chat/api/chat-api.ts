import { z } from "zod"

import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
  type CalculationFeedbackRequest,
  calculationFeedbackRequestSchema,
  type CalculationFeedbackResponse,
  calculationFeedbackResponseSchema,
} from "@/features/chat/schemas/calculation-schemas"
import {
  type CitationDocument,
  citationDocumentSchema,
  type Conversation,
  conversationSchema,
  type CreateConversationRequest,
  createConversationRequestSchema,
  type Message,
  messageSchema,
} from "@/features/chat/schemas/chat-schemas"
import { httpClient } from "@/lib/axios-client"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import type { ApiResponse } from "@/utils/api-response"

export const chatApi = {
  async getCitationDocument(documentId: string): Promise<CitationDocument> {
    const response = await httpClient.get<ApiResponse<CitationDocument>>(
      API_ENDPOINTS.documents.documentCitation(documentId)
    )

    return readSuccessData(response.data, citationDocumentSchema)
  },

  async claimConversation(conversationId: string): Promise<Conversation> {
    const response = await httpClient.patch<ApiResponse<Conversation>>(
      API_ENDPOINTS.conversations.conversationClaim(conversationId)
    )

    return readSuccessData(response.data, conversationSchema)
  },

  async createConversation(
    input: CreateConversationRequest
  ): Promise<Conversation> {
    const request = createConversationRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<Conversation>>(
      API_ENDPOINTS.conversations.conversations,
      request
    )

    return readSuccessData(response.data, conversationSchema)
  },

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    const response = await httpClient.get<ApiResponse<Conversation[]>>(
      API_ENDPOINTS.conversations.conversations,
      { params: { userId } }
    )

    return readSuccessData(response.data, z.array(conversationSchema))
  },

  async getGuestConversations(): Promise<Conversation[]> {
    const response = await httpClient.get<ApiResponse<Conversation[]>>(
      API_ENDPOINTS.conversations.conversationsGuest
    )

    return readSuccessData(response.data, z.array(conversationSchema))
  },

  async getMessageDetail(messageId: string): Promise<Message> {
    const response = await httpClient.get<ApiResponse<Message>>(
      API_ENDPOINTS.messages.message(messageId)
    )

    return readSuccessData(response.data, messageSchema)
  },

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const response = await httpClient.get<ApiResponse<Message[]>>(
      API_ENDPOINTS.messages.messagesByConversation(conversationId)
    )

    return readSuccessData(response.data, z.array(messageSchema))
  },

  async submitCalculationFeedback(
    messageId: string,
    input: CalculationFeedbackRequest
  ): Promise<CalculationFeedbackResponse> {
    const request = calculationFeedbackRequestSchema.parse(input)
    const response = await httpClient.post<
      ApiResponse<CalculationFeedbackResponse>
    >(API_ENDPOINTS.messages.calculationFeedback(messageId), request)

    return readSuccessData(response.data, calculationFeedbackResponseSchema)
  },

  /** "Xóa tất cả": soft-deletes every conversation of the caller; returns how many. */
  async softDeleteAllConversations(): Promise<number> {
    const response = await httpClient.delete<ApiResponse<number>>(
      API_ENDPOINTS.conversations.conversationsDeleteBatch
    )

    return (
      readApiResponse(response.data, z.number().int().nonnegative()).data ?? 0
    )
  },

  /** Pins (or unpins) a conversation of the caller to the top of the sidebar. */
  async setConversationPinned(
    conversationId: string,
    pinned: boolean
  ): Promise<Conversation> {
    const response = await httpClient.patch<ApiResponse<Conversation>>(
      API_ENDPOINTS.conversations.conversationPin(conversationId),
      { pinned }
    )

    return readSuccessData(response.data, conversationSchema)
  },

  async softDeleteConversation(conversationId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.conversations.conversation(conversationId)
    )

    readApiResponse(response.data, z.null())
  },
}
