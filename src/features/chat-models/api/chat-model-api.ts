import { z } from "zod"

import {
  type ChatModel,
  chatModelPageSchema,
  type ChatModelPage,
  chatModelSchema,
  type CreateChatModelRequest,
  createChatModelRequestSchema,
  type UpdateChatModelRequest,
  updateChatModelRequestSchema,
} from "@/features/chat-models/schemas/chat-model-schemas"
import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/utils/api-response"

export const chatModelApi = {
  async createChatModel(input: CreateChatModelRequest): Promise<ChatModel> {
    const request = createChatModelRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<ChatModel>>(
      API_ENDPOINTS.chatModels.chatModels,
      request
    )

    return readSuccessData(response.data, chatModelSchema)
  },

  async deleteChatModel(chatModelId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.chatModels.chatModel(chatModelId)
    )

    readApiResponse(response.data, z.null())
  },

  async getChatModels(page: number, limit: number): Promise<ChatModelPage> {
    const response = await httpClient.get<ApiResponse<ChatModelPage>>(
      API_ENDPOINTS.chatModels.chatModels,
      { params: { page: page - 1, size: limit } }
    )

    return readSuccessData(response.data, chatModelPageSchema)
  },

  async recoverChatModel(chatModelId: string): Promise<void> {
    const response = await httpClient.post<ApiResponse<null>>(
      API_ENDPOINTS.chatModels.chatModelRecover(chatModelId)
    )

    readApiResponse(response.data, z.null())
  },

  async updateChatModel(
    chatModelId: string,
    input: UpdateChatModelRequest
  ): Promise<ChatModel> {
    const request = updateChatModelRequestSchema.parse(input)
    const response = await httpClient.put<ApiResponse<ChatModel>>(
      API_ENDPOINTS.chatModels.chatModel(chatModelId),
      request
    )

    return readSuccessData(response.data, chatModelSchema)
  },
}
