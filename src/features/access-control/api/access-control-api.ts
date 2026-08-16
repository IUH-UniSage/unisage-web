import { z } from "zod"

import {
  accessPermissionPageSchema,
  accessRolePageSchema,
  accessRoleSchema,
  type AccessPermissionPage,
  type AccessRole,
  type AccessRolePage,
  type CreateRoleRequest,
  createRoleRequestSchema,
  type UpdateRoleRequest,
  updateRoleRequestSchema,
} from "@/features/access-control/schemas/access-control-schemas"
import { readApiResponse, readSuccessData } from "@/lib/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/types/api"

const LIST_PAGE_SIZE = 500

export const accessControlApi = {
  async createRole(input: CreateRoleRequest): Promise<AccessRole> {
    const request = createRoleRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<AccessRole>>(
      "/rbac/roles",
      request
    )

    return readSuccessData(response.data, accessRoleSchema)
  },

  async deleteRole(roleId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      `/rbac/roles/${roleId}`
    )

    readApiResponse(response.data, z.null())
  },

  async getPermissions(): Promise<AccessPermissionPage> {
    const response = await httpClient.get<ApiResponse<AccessPermissionPage>>(
      "/rbac/permissions",
      { params: { limit: LIST_PAGE_SIZE, page: 1 } }
    )

    return readSuccessData(response.data, accessPermissionPageSchema)
  },

  async getRoles(): Promise<AccessRolePage> {
    const response = await httpClient.get<ApiResponse<AccessRolePage>>(
      "/rbac/roles",
      { params: { limit: LIST_PAGE_SIZE, page: 1 } }
    )

    return readSuccessData(response.data, accessRolePageSchema)
  },

  async recoverRole(roleId: string): Promise<void> {
    const response = await httpClient.post<ApiResponse<null>>(
      `/rbac/roles/${roleId}/recover`
    )

    readApiResponse(response.data, z.null())
  },

  async updateRole(
    roleId: string,
    input: UpdateRoleRequest
  ): Promise<AccessRole> {
    const request = updateRoleRequestSchema.parse(input)
    const response = await httpClient.put<ApiResponse<AccessRole>>(
      `/rbac/roles/${roleId}`,
      request
    )

    return readSuccessData(response.data, accessRoleSchema)
  },
}
