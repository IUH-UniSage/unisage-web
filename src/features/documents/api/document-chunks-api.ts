import axios from "axios"

import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { documentChunkPageResponseSchema } from "@/features/documents/schemas/document-chunks-schemas"
import type { DocumentChunkPageResponse } from "@/features/documents/schemas/document-chunks-schemas"
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
}
