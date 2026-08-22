import { z } from "zod"

import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { httpClient } from "@/lib/axios-client"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import type { ApiResponse } from "@/utils/api-response"
import {
  appUserPageSchema,
  appUserSchema,
  createUserRequestSchema,
  updateUserRequestSchema,
  type AppUser,
  type AppUserPage,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "@/features/users/schemas/user-schemas"

const LIST_PAGE_SIZE = 500

export const userApi = {
  async getUsers(): Promise<AppUserPage> {
    const response = await httpClient.get<ApiResponse<AppUserPage>>(
      API_ENDPOINTS.users.users,
      { params: { limit: LIST_PAGE_SIZE, page: 1 } }
    )

    return readSuccessData(response.data, appUserPageSchema)
  },

  async createUser(input: CreateUserRequest): Promise<AppUser> {
    const request = createUserRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<AppUser>>(
      API_ENDPOINTS.users.users,
      request
    )

    return readSuccessData(response.data, appUserSchema)
  },

  async updateUser(userId: string, input: UpdateUserRequest): Promise<AppUser> {
    const request = updateUserRequestSchema.parse(input)
    const response = await httpClient.put<ApiResponse<AppUser>>(
      API_ENDPOINTS.users.user(userId),
      request
    )

    return readSuccessData(response.data, appUserSchema)
  },

  async deleteUser(userId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.users.user(userId)
    )

    readApiResponse(response.data, z.null())
  },

  async recoverUser(userId: string): Promise<void> {
    const response = await httpClient.post<ApiResponse<null>>(
      API_ENDPOINTS.users.userRecover(userId)
    )

    readApiResponse(response.data, z.null())
  },

  async deleteUsersBulk(userIds: string[]): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.users.usersBulkDelete,
      { data: userIds }
    )

    readApiResponse(response.data, z.null())
  },

  async recoverUsersBulk(userIds: string[]): Promise<void> {
    const response = await httpClient.post<ApiResponse<null>>(
      API_ENDPOINTS.users.usersBulkRecover,
      userIds
    )

    readApiResponse(response.data, z.null())
  },
}
