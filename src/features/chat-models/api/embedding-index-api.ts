import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
  type EmbeddingIndex,
  embeddingIndexSchema,
  type EmbeddingReindexRun,
  embeddingReindexRunSchema,
} from "@/features/chat-models/schemas/embedding-index-schemas"
import { httpClient } from "@/lib/axios-client"
import { readSuccessData } from "@/utils/api-response"
import type { ApiResponse } from "@/utils/api-response"

export const embeddingIndexApi = {
  async cancelReindex(runId: string): Promise<EmbeddingReindexRun> {
    const response = await httpClient.post<ApiResponse<EmbeddingReindexRun>>(
      API_ENDPOINTS.chatModels.embeddingReindexCancel(runId)
    )

    return readSuccessData(response.data, embeddingReindexRunSchema)
  },

  async getEmbeddingIndex(): Promise<EmbeddingIndex> {
    const response = await httpClient.get<ApiResponse<EmbeddingIndex>>(
      API_ENDPOINTS.chatModels.embeddingIndex
    )

    return readSuccessData(response.data, embeddingIndexSchema)
  },

  async startReindex(chatModelId: string): Promise<EmbeddingReindexRun> {
    const response = await httpClient.post<ApiResponse<EmbeddingReindexRun>>(
      API_ENDPOINTS.chatModels.embeddingReindex,
      { chatModelId }
    )

    return readSuccessData(response.data, embeddingReindexRunSchema)
  },
}
