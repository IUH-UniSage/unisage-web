import { z } from "zod"

import {
  accessPermissionPageSchema,
  accessPermissionSchema,
  accessRolePageSchema,
  accessRoleSchema,
  type AccessPermission,
  type AccessPermissionPage,
  type AccessRole,
  type AccessRolePage,
  type CreatePermissionRequest,
  createPermissionRequestSchema,
  type CreateRoleRequest,
  createRoleRequestSchema,
  type UpdatePermissionRequest,
  updatePermissionRequestSchema,
  type UpdateRoleRequest,
  updateRoleRequestSchema,
} from "@/features/access-control/schemas/access-control-schemas"
import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/utils/api-response"

const LIST_PAGE_SIZE = 500

export const accessControlApi = {
  async createPermission(
    input: CreatePermissionRequest
  ): Promise<AccessPermission> {
    const request = createPermissionRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<AccessPermission>>(
      API_ENDPOINTS.rbac.permissions,
      request
    )

    return readSuccessData(response.data, accessPermissionSchema)
  },

  async createRole(input: CreateRoleRequest): Promise<AccessRole> {
    const request = createRoleRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<AccessRole>>(
      API_ENDPOINTS.rbac.roles,
      request
    )

    return readSuccessData(response.data, accessRoleSchema)
  },

  async deletePermission(permissionId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.rbac.permission(permissionId)
    )

    readApiResponse(response.data, z.null())
  },

  async deletePermissionsBulk(permissionIds: string[]): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.rbac.permissionsBulkDelete,
      { data: permissionIds }
    )

    readApiResponse(response.data, z.null())
  },

  async deleteRole(roleId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.rbac.role(roleId)
    )

    readApiResponse(response.data, z.null())
  },

  async deleteRolesBulk(roleIds: string[]): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.rbac.rolesBulkDelete,
      { data: roleIds }
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

  async recoverPermission(permissionId: string): Promise<void> {
    const response = await httpClient.post<ApiResponse<null>>(
      API_ENDPOINTS.rbac.permissionRecover(permissionId)
    )

    readApiResponse(response.data, z.null())
  },

  async recoverPermissionsBulk(permissionIds: string[]): Promise<void> {
    const response = await httpClient.post<ApiResponse<null>>(
      API_ENDPOINTS.rbac.permissionsBulkRecover,
      permissionIds
    )

    readApiResponse(response.data, z.null())
  },

  async recoverRole(roleId: string): Promise<void> {
    const response = await httpClient.post<ApiResponse<null>>(
      API_ENDPOINTS.rbac.roleRecover(roleId)
    )

    readApiResponse(response.data, z.null())
  },

  async recoverRolesBulk(roleIds: string[]): Promise<void> {
    const response = await httpClient.post<ApiResponse<null>>(
      API_ENDPOINTS.rbac.rolesBulkRecover,
      roleIds
    )

    readApiResponse(response.data, z.null())
  },

  async updatePermission(
    permissionId: string,
    input: UpdatePermissionRequest
  ): Promise<AccessPermission> {
    const request = updatePermissionRequestSchema.parse(input)
    const response = await httpClient.put<ApiResponse<AccessPermission>>(
      API_ENDPOINTS.rbac.permission(permissionId),
      request
    )

    return readSuccessData(response.data, accessPermissionSchema)
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
