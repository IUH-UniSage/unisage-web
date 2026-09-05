import { z } from "zod"

import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { httpClient } from "@/lib/axios-client"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import type { ApiResponse } from "@/utils/api-response"
import {
  departmentAccessSuggestionSchema,
  departmentRequestSchema,
  departmentSchema,
  type CreateDepartmentRequest,
  type Department,
  type DepartmentAccessSuggestion,
} from "@/features/departments/schemas/department-schemas"

export const departmentApi = {
  async getAccessSuggestion(
    parentId: string,
    userId: string
  ): Promise<DepartmentAccessSuggestion> {
    const response = await httpClient.get<
      ApiResponse<DepartmentAccessSuggestion>
    >(API_ENDPOINTS.departments.accessSuggestion(parentId), {
      params: { userId },
    })

    return readSuccessData(response.data, departmentAccessSuggestionSchema)
  },

  async getDepartments(): Promise<Department[]> {
    const response = await httpClient.get<ApiResponse<Department[]>>(
      API_ENDPOINTS.departments.departmentsRoots
    )

    return readSuccessData(response.data, z.array(departmentSchema))
  },

  async createDepartment(input: CreateDepartmentRequest): Promise<Department> {
    const request = departmentRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<Department>>(
      API_ENDPOINTS.departments.departments,
      request
    )

    return readSuccessData(response.data, departmentSchema)
  },

  async updateDepartment(
    departmentId: string,
    input: CreateDepartmentRequest
  ): Promise<Department> {
    const request = departmentRequestSchema.parse(input)
    const response = await httpClient.put<ApiResponse<Department>>(
      API_ENDPOINTS.departments.department(departmentId),
      request
    )

    return readSuccessData(response.data, departmentSchema)
  },

  async deleteDepartment(departmentId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.departments.department(departmentId)
    )

    readApiResponse(response.data, z.null())
  },

  async recoverDepartment(departmentId: string): Promise<void> {
    // Backend uses PATCH /{id}/recover
    const response = await httpClient.patch<ApiResponse<null>>(
      API_ENDPOINTS.departments.departmentRecover(departmentId)
    )

    readApiResponse(response.data, z.null())
  },
}
