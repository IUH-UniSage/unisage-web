import { z } from "zod"

import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { httpClient } from "@/lib/axios-client"
import {
  appUserSchema,
  type AppUser,
} from "@/features/users/schemas/user-schemas"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import type { ApiResponse } from "@/utils/api-response"

export const profileApi = {
  async changePassword(input: {
    currentPassword: string
    newPassword: string
  }): Promise<void> {
    const response = await httpClient.patch<ApiResponse<null>>(
      API_ENDPOINTS.users.myPassword,
      input
    )

    readApiResponse(response.data, z.null())
  },

  async getMe(): Promise<AppUser> {
    const response = await httpClient.get<ApiResponse<AppUser>>(
      API_ENDPOINTS.users.me
    )

    return readSuccessData(response.data, appUserSchema)
  },
}
