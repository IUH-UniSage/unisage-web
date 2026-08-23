import { useMutation, useQueryClient } from "@tanstack/react-query"

import { categoryApi } from "@/features/categories/api/category-api"
import { categoryKeys } from "@/features/categories/queries/keys"
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/features/categories/schemas/category-schemas"

export function useCreateCategoryMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: categoryKeys.list(),
      successMessage: "Đã tạo danh mục mới.",
    },
    mutationFn: (input: CreateCategoryRequest) =>
      categoryApi.createCategory(input),
  })
}

type UpdateCategoryVariables = {
  categoryId: string
  input: UpdateCategoryRequest
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: {
      invalidatesQuery: categoryKeys.list(),
      successMessage: "Đã cập nhật danh mục.",
    },
    mutationFn: ({ categoryId, input }: UpdateCategoryVariables) =>
      categoryApi.updateCategory(categoryId, input),
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData(
        categoryKeys.list(),
        (
          current:
            Awaited<ReturnType<typeof categoryApi.getCategories>> | undefined
        ) =>
          current?.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category
          )
      )
    },
  })
}

export function useDeactivateCategoryMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: categoryKeys.list(),
      successMessage: "Đã vô hiệu hóa danh mục.",
    },
    mutationFn: (categoryId: string) =>
      categoryApi.deactivateCategory(categoryId),
  })
}
