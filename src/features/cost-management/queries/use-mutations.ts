import { useMutation } from "@tanstack/react-query"

import { costManagementApi } from "@/features/cost-management/api/cost-management-api"
import { costManagementKeys } from "@/features/cost-management/queries/keys"
import type {
  CreateBudgetRequest,
  ModelPriceRequest,
  UpdateBudgetAlertSettingRequest,
  UpdateBudgetRequest,
} from "@/features/cost-management/schemas/cost-management-schemas"

export function useCreateBudgetMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: costManagementKeys.budgets(),
      successMessage: "Đã tạo ngân sách mới.",
    },
    mutationFn: (input: CreateBudgetRequest) =>
      costManagementApi.createBudget(input),
  })
}

type UpdateBudgetVariables = {
  budgetId: string
  input: UpdateBudgetRequest
}

export function useUpdateBudgetMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: costManagementKeys.budgets(),
      successMessage: "Đã cập nhật ngân sách.",
    },
    mutationFn: ({ budgetId, input }: UpdateBudgetVariables) =>
      costManagementApi.updateBudget(budgetId, input),
  })
}

export function useDeleteBudgetMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: costManagementKeys.budgets(),
      successMessage: "Đã xoá ngân sách.",
    },
    mutationFn: (budgetId: string) => costManagementApi.deleteBudget(budgetId),
  })
}

export function useUpdateBudgetAlertSettingsMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: costManagementKeys.alertSettings(),
      successMessage: "Đã cập nhật cấu hình cảnh báo.",
    },
    mutationFn: (input: UpdateBudgetAlertSettingRequest) =>
      costManagementApi.updateBudgetAlertSettings(input),
  })
}

export function useDismissBudgetAlertMutation() {
  return useMutation({
    meta: {
      // Both the history table (alerts()) and the banner (activeAlerts())
      // need to refresh after a dismiss - invalidate the whole feature
      // namespace rather than picking one key and missing the other.
      invalidatesQuery: costManagementKeys.all,
      successMessage: "Đã tắt cảnh báo.",
    },
    mutationFn: (alertId: string) =>
      costManagementApi.dismissBudgetAlert(alertId),
  })
}

// Every price change also writes a history row, so prices and history refresh together.
export function useSyncModelPricesMutation() {
  return useMutation({
    meta: { invalidatesQuery: costManagementKeys.modelPricing() },
    mutationFn: () => costManagementApi.syncModelPrices(),
  })
}

export function useCreateModelPriceMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: costManagementKeys.modelPricing(),
      successMessage: "Đã thêm giá mô hình.",
    },
    mutationFn: (input: ModelPriceRequest) =>
      costManagementApi.createModelPrice(input),
  })
}

type UpdateModelPriceVariables = {
  input: ModelPriceRequest
  priceId: string
}

export function useUpdateModelPriceMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: costManagementKeys.modelPricing(),
      successMessage: "Đã cập nhật giá mô hình.",
    },
    mutationFn: ({ input, priceId }: UpdateModelPriceVariables) =>
      costManagementApi.updateModelPrice(priceId, input),
  })
}

export function useResetModelPriceMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: costManagementKeys.modelPricing(),
      successMessage: "Đã khôi phục giá theo LiteLLM.",
    },
    mutationFn: (priceId: string) => costManagementApi.resetModelPrice(priceId),
  })
}
