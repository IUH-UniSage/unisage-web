import axios from "axios"

import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
  chunkingResponseSchema,
  embeddingAcceptedResponseSchema,
  ingestionJobResponseSchema,
  previewResponseSchema,
  type ChunkingRequest,
  type ChunkingResponse,
  type EmbeddingAcceptedResponse,
  type EmbeddingRequest,
  type IngestionJobResponse,
  type PreviewRequest,
  type PreviewResponse,
} from "@/features/ingestion/schemas/ingestion-schemas"
import { aiHttpClient } from "@/lib/ai-client"
import { readSuccessData } from "@/utils/api-response"

export const ingestionApi = {
  async chunk(input: ChunkingRequest): Promise<ChunkingResponse> {
    const response = await aiHttpClient.post(
      API_ENDPOINTS.ingestion.chunking,
      input
    )

    return readSuccessData(response.data, chunkingResponseSchema)
  },

  async embed(input: EmbeddingRequest): Promise<EmbeddingAcceptedResponse> {
    const response = await aiHttpClient.post(
      API_ENDPOINTS.ingestion.embedding,
      input
    )

    return readSuccessData(response.data, embeddingAcceptedResponseSchema)
  },

  /**
   * Returns the resumable ingestion record for a document, or `null` if
   * none exists yet - a 404 here is a valid outcome ("no draft"), not an
   * error, so it's translated to `null` rather than left for the caller to
   * distinguish from a real failure. When the record is at the embedding
   * step the response carries the live task state inline (`task_state`).
   */
  async getJob(documentId: string): Promise<IngestionJobResponse | null> {
    try {
      const response = await aiHttpClient.get(
        API_ENDPOINTS.ingestion.job(documentId)
      )

      return readSuccessData(response.data, ingestionJobResponseSchema)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }

      throw error
    }
  },

  async preview(input: PreviewRequest): Promise<PreviewResponse> {
    const response = await aiHttpClient.post(
      API_ENDPOINTS.ingestion.preview,
      input
    )

    return readSuccessData(response.data, previewResponseSchema)
  },
}
