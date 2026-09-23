import axios from "axios"

import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
  documentChunkPageResponseSchema,
  indexedChunkPageResponseSchema,
} from "@/features/documents/schemas/document-chunks-schemas"
import type {
  DocumentChunkPageResponse,
  IndexedChunkPageResponse,
} from "@/features/documents/schemas/document-chunks-schemas"
import { aiHttpClient } from "@/lib/ai-client"
import { readSuccessData } from "@/utils/api-response"

export const documentChunksApi = {
  /**
   * Returns `null` if the document has no chunking draft yet (unisage-agent
   * 404s `DOCUMENT_CHUNKS_NOT_FOUND`) - same "not an error" outcome
   * `ingestionApi.getJob` already treats as `null` rather than throwing.
   */
  async list(
    documentId: string,
    { page = 1, limit = 20 }: { limit?: number; page?: number } = {}
  ): Promise<DocumentChunkPageResponse | null> {
    try {
      const response = await aiHttpClient.get(
        API_ENDPOINTS.agentDocuments.chunks(documentId),
        { params: { limit, page } }
      )

      return readSuccessData(response.data, documentChunkPageResponseSchema)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }

      throw error
    }
  },

  async deleteIndexedChunk(documentId: string, chunkId: string): Promise<void> {
    await aiHttpClient.delete(
      API_ENDPOINTS.agentDocuments.deleteIndexedChunk(documentId, chunkId)
    )
  },

  /**
   * Lists chunks as actually indexed in Qdrant (with `summary`/`questions`) -
   * unlike `list()` above, this never 404s: an empty page is a normal state
   * (chunked but not embedded yet, or nothing ingested at all).
   */
  async listIndexed(
    documentId: string,
    { page = 1, limit = 20 }: { limit?: number; page?: number } = {}
  ): Promise<IndexedChunkPageResponse> {
    const response = await aiHttpClient.get(
      API_ENDPOINTS.agentDocuments.indexedChunks(documentId),
      { params: { limit, page } }
    )

    return readSuccessData(response.data, indexedChunkPageResponseSchema)
  },
}
