import { z } from "zod"

import {
  accessLevelListSchema,
  accessLevelSchema,
  type AccessLevel,
  type AccessLevelList,
  type CreateAccessLevelRequest,
  createAccessLevelRequestSchema,
  type UpdateAccessLevelRequest,
  updateAccessLevelRequestSchema,
} from "@/features/access-level/schemas/access-level-schemas"
import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/utils/api-response"

export const accessLevelApi = {
  async createAccessLevel(
    input: CreateAccessLevelRequest
  ): Promise<AccessLevel> {
    const request = createAccessLevelRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<AccessLevel>>(
      API_ENDPOINTS.accessLevels.accessLevels,
      request
    )

    return readSuccessData(response.data, accessLevelSchema)
  },

  async deleteAccessLevel(accessLevelId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.accessLevels.accessLevel(accessLevelId)
    )

    readApiResponse(response.data, z.null())
  },

  async getAccessLevels(): Promise<AccessLevelList> {
    const response = await httpClient.get<ApiResponse<AccessLevelList>>(
      API_ENDPOINTS.accessLevels.accessLevels
    )

    return readSuccessData(response.data, accessLevelListSchema)
  },

  async updateAccessLevel(
    accessLevelId: string,
    input: UpdateAccessLevelRequest
  ): Promise<AccessLevel> {
    const request = updateAccessLevelRequestSchema.parse(input)
    const response = await httpClient.put<ApiResponse<AccessLevel>>(
      API_ENDPOINTS.accessLevels.accessLevel(accessLevelId),
      request
    )

    return readSuccessData(response.data, accessLevelSchema)
  },
}
