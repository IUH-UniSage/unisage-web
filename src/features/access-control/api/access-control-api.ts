import {
  accessPermissionPageSchema,
  accessRolePageSchema,
  accessRoleSchema,
  type AccessPermissionPage,
  type AccessRole,
  type AccessRolePage,
  type UpdateRoleRequest,
  updateRoleRequestSchema,
} from "@/features/access-control/schemas/access-control-schemas"
import { readSuccessData } from "@/lib/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/types/api"

const LIST_PAGE_SIZE = 500

export const accessControlApi = {
  async getPermissions(): Promise<AccessPermissionPage> {
    const response = await httpClient.get<ApiResponse<AccessPermissionPage>>(
      "/rbac/permissions",
      { params: { page: 0, size: LIST_PAGE_SIZE } }
    )

    return readSuccessData(response.data, accessPermissionPageSchema)
  },

  async getRoles(): Promise<AccessRolePage> {
    const response = await httpClient.get<ApiResponse<AccessRolePage>>(
      "/rbac/roles",
      { params: { page: 0, size: LIST_PAGE_SIZE } }
    )

    return readSuccessData(response.data, accessRolePageSchema)
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
