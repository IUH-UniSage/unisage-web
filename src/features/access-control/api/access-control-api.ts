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
import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/utils/api-response"

const LIST_PAGE_SIZE = 500

export const accessControlApi = {
  async createRole(input: CreateRoleRequest): Promise<AccessRole> {
    const request = createRoleRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<AccessRole>>(
      API_ENDPOINTS.rbac.roles,
      request
    )

    return readSuccessData(response.data, accessRoleSchema)
  },

  async deleteRole(roleId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.rbac.role(roleId)
    )

    readApiResponse(response.data, z.null())
  },

  async getPermissions(): Promise<AccessPermissionPage> {
    const response = await httpClient.get<ApiResponse<AccessPermissionPage>>(
      API_ENDPOINTS.rbac.permissions,
      { params: { limit: LIST_PAGE_SIZE, page: 1 } }
    )

    return readSuccessData(response.data, accessPermissionPageSchema)
  },

  async getRoles(): Promise<AccessRolePage> {
    const response = await httpClient.get<ApiResponse<AccessRolePage>>(
      API_ENDPOINTS.rbac.roles,
      { params: { limit: LIST_PAGE_SIZE, page: 1 } }
    )

    return readSuccessData(response.data, accessRolePageSchema)
  },

  async recoverRole(roleId: string): Promise<void> {
    const response = await httpClient.post<ApiResponse<null>>(
      API_ENDPOINTS.rbac.roleRecover(roleId)
    )

    readApiResponse(response.data, z.null())
  },

  async updateRole(
    roleId: string,
    input: UpdateRoleRequest
  ): Promise<AccessRole> {
    const request = updateRoleRequestSchema.parse(input)
    const response = await httpClient.put<ApiResponse<AccessRole>>(
      API_ENDPOINTS.rbac.role(roleId),
      request
    )

    return readSuccessData(response.data, accessRoleSchema)
  },
}
