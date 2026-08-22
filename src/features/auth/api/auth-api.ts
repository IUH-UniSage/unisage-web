import { z } from "zod"

import type {
  AuthResponse,
  LoginRequest,
  RefreshResponse,
} from "@/features/auth/schemas/auth-schemas"
import {
  authResponseSchema,
  loginRequestSchema,
  refreshResponseSchema,
} from "@/features/auth/schemas/auth-schemas"
import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/utils/api-response"

export const authApi = {
  async login(input: LoginRequest): Promise<AuthResponse> {
    const request = loginRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.auth.login,
      request
    )

    return readSuccessData(response.data, authResponseSchema)
  },

  async logout(): Promise<void> {
    const response = await httpClient.post<ApiResponse<null>>(
      API_ENDPOINTS.auth.logout
    )

    readApiResponse(response.data, z.null())
  },

  async refresh(): Promise<RefreshResponse> {
    const response = await httpClient.post<ApiResponse<RefreshResponse>>(
      API_ENDPOINTS.auth.refresh
    )

    return readSuccessData(response.data, refreshResponseSchema)
  },
}
