import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
  type ContinuedShare,
  continuedShareSchema,
  type CreatedShare,
  createdShareSchema,
  type CreateShareRequest,
  createShareRequestSchema,
  revokedCountSchema,
  type SharedConversation,
  sharedConversationSchema,
  type SharePage,
  sharePageSchema,
} from "@/features/conversations/schemas/share-schemas"
import { httpClient } from "@/lib/axios-client"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import type { ApiResponse } from "@/utils/api-response"
import { z } from "zod"

export type MySharesParams = {
  // 1-based (the backend reads one-indexed `page` and `limit`).
  limit: number
  page: number
}

export const shareApi = {
  async continueShare(token: string): Promise<ContinuedShare> {
    const response = await httpClient.post<ApiResponse<ContinuedShare>>(
      API_ENDPOINTS.shares.shareContinue(token)
    )

    return readSuccessData(response.data, continuedShareSchema)
  },

  async createShare(input: CreateShareRequest): Promise<CreatedShare> {
    const request = createShareRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<CreatedShare>>(
      API_ENDPOINTS.shares.shares,
      request
    )

    return readSuccessData(response.data, createdShareSchema)
  },

  async getMyShares({ limit, page }: MySharesParams): Promise<SharePage> {
    const response = await httpClient.get<ApiResponse<SharePage>>(
      API_ENDPOINTS.shares.shares,
      { params: { limit, page } }
    )

    return readSuccessData(response.data, sharePageSchema)
  },

  async getSharedConversation(token: string): Promise<SharedConversation> {
    const response = await httpClient.get<ApiResponse<SharedConversation>>(
      API_ENDPOINTS.shares.shareView(token)
    )

    return readSuccessData(response.data, sharedConversationSchema)
  },

  async revokeAllShares(): Promise<number> {
    const response = await httpClient.delete<ApiResponse<number>>(
      API_ENDPOINTS.shares.shares
    )

    return readApiResponse(response.data, revokedCountSchema).data ?? 0
  },

  async revokeShare(shareId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.shares.share(shareId)
    )

    readApiResponse(response.data, z.unknown())
  },
}
