import axios from "axios"

import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
  chunkingResponseSchema,
  embeddingAcceptedResponseSchema,
  embeddingStatusResponseSchema,
  ingestionJobResponseSchema,
  previewResponseSchema,
  type ChunkingRequest,
  type ChunkingResponse,
  type EmbeddingAcceptedResponse,
  type EmbeddingRequest,
  type EmbeddingStatusResponse,
  type IngestionJobResponse,
  type PreviewRequest,
  type PreviewResponse,
} from "@/features/ingestion/schemas/ingestion-schemas"
import { aiHttpClient } from "@/lib/ai-client"
import { readAiSuccessData } from "@/utils/ai-response"

export const ingestionApi = {
  async chunk(input: ChunkingRequest): Promise<ChunkingResponse> {
    const response = await aiHttpClient.post(
      API_ENDPOINTS.ingestion.chunking,
      input
    )

    return readAiSuccessData(response.data, chunkingResponseSchema)
  },

  async embed(input: EmbeddingRequest): Promise<EmbeddingAcceptedResponse> {
    const response = await aiHttpClient.post(
      API_ENDPOINTS.ingestion.embedding,
      input
    )

    return readAiSuccessData(response.data, embeddingAcceptedResponseSchema)
  },

  /**
   * Clears a document's ingestion job row once its embed task has reached a
   * terminal state (SUCCESS/FAILURE) - a no-op server-side if none exists.
   */
  async deleteJob(documentId: string): Promise<void> {
    await aiHttpClient.delete(API_ENDPOINTS.ingestion.job(documentId))
  },

  /**
   * Poll-friendly HTTP equivalent of one WebSocket progress frame - lets a
   * caller detect an embed task finishing without keeping a WebSocket open.
   */
  async getEmbeddingStatus(taskId: string): Promise<EmbeddingStatusResponse> {
    const response = await aiHttpClient.get(
      API_ENDPOINTS.ingestion.embeddingStatus(taskId)
    )

    return readAiSuccessData(response.data, embeddingStatusResponseSchema)
  },

  /**
   * Returns the resumable chunking draft for a document, or `null` if none
   * exists yet - a 404 here is a valid outcome ("no draft"), not an error,
   * so it's translated to `null` rather than left for the caller to
   * distinguish from a real failure.
   */
  async getJob(documentId: string): Promise<IngestionJobResponse | null> {
    try {
      const response = await aiHttpClient.get(
        API_ENDPOINTS.ingestion.job(documentId)
      )

      return readAiSuccessData(response.data, ingestionJobResponseSchema)
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

    return readAiSuccessData(response.data, previewResponseSchema)
  },
}
