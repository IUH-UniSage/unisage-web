import { z } from "zod"

import {
  categoryListSchema,
  categorySchema,
  type Category,
  type CategoryList,
  type CreateCategoryRequest,
  createCategoryRequestSchema,
  type UpdateCategoryRequest,
  updateCategoryRequestSchema,
} from "@/features/categories/schemas/category-schemas"
import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/utils/api-response"

export const categoryApi = {
  async createCategory(input: CreateCategoryRequest): Promise<Category> {
    const request = createCategoryRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<Category>>(
      API_ENDPOINTS.categories.categories,
      request
    )

    return readSuccessData(response.data, categorySchema)
  },

  async deactivateCategory(categoryId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.categories.category(categoryId)
    )

    readApiResponse(response.data, z.null())
  },

  async getCategories(): Promise<CategoryList> {
    const response = await httpClient.get<ApiResponse<CategoryList>>(
      API_ENDPOINTS.categories.categories
    )

    return readSuccessData(response.data, categoryListSchema)
  },

  async updateCategory(
    categoryId: string,
    input: UpdateCategoryRequest
  ): Promise<Category> {
    const request = updateCategoryRequestSchema.parse(input)
    const response = await httpClient.put<ApiResponse<Category>>(
      API_ENDPOINTS.categories.category(categoryId),
      request
    )

    return readSuccessData(response.data, categorySchema)
  },
}
