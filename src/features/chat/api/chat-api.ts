import { z } from "zod"

import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
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

  async softDeleteConversation(conversationId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.conversations.conversation(conversationId)
    )

    readApiResponse(response.data, z.null())
  },
}
