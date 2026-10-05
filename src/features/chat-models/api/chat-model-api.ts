import { z } from "zod"

import {
  type ChatModel,
  chatModelPageSchema,
  type ChatModelPage,
  type ChatModelPurpose,
  chatModelSchema,
  type ChatModelStatus,
  chatModelStatusRequestSchema,
  type CreateChatModelRequest,
  createChatModelRequestSchema,
  type UpdateChatModelRequest,
  updateChatModelRequestSchema,
} from "@/features/chat-models/schemas/chat-model-schemas"
import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/utils/api-response"

export type ChatModelsParams = {
  isActive?: boolean
  modelPurpose?: ChatModelPurpose
  // 1-based; the backend uses spring.data.web.pageable.one-indexed-parameters=true.
  page: number
  q?: string
  size: number
  sort?: "asc" | "desc"
  status?: ChatModelStatus
}

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

  async getChatModels({
    isActive,
    modelPurpose,
    page,
    q,
    size,
    sort,
    status,
  }: ChatModelsParams): Promise<ChatModelPage> {
    const response = await httpClient.get<ApiResponse<ChatModelPage>>(
      API_ENDPOINTS.chatModels.chatModels,
      {
        params: {
          isActive,
          limit: size,
          modelPurpose,
          page,
          q: q || undefined,
          sort: sort ? `priority,${sort}` : undefined,
          status,
        },
      }
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

  // ACTIVE/INACTIVE only - every other status transition happens server-side
  // via verify/promote (see chatModelStatusRequestSchema).
  async updateChatModelStatus(
    chatModelId: string,
    status: ChatModelStatus
  ): Promise<ChatModel> {
    const request = chatModelStatusRequestSchema.parse({ status })
    const response = await httpClient.patch<ApiResponse<ChatModel>>(
      API_ENDPOINTS.chatModels.chatModelStatus(chatModelId),
      request
    )

    return readSuccessData(response.data, chatModelSchema)
  },

  async verifyChatModel(chatModelId: string): Promise<ChatModel> {
    const response = await httpClient.post<ApiResponse<ChatModel>>(
      API_ENDPOINTS.chatModels.chatModelVerify(chatModelId)
    )

    return readSuccessData(response.data, chatModelSchema)
  },
}
