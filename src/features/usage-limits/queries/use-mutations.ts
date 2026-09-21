import { useMutation } from "@tanstack/react-query"

import { usageLimitApi } from "@/features/usage-limits/api/usage-limit-api"
import { usageLimitKeys } from "@/features/usage-limits/queries/keys"
import type { UsageLimitPlanRequest } from "@/features/usage-limits/schemas/usage-limit-schemas"

export function useCreateUsageLimitPlanMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: usageLimitKeys.plans(),
      successMessage: "Đã tạo gói hạn mức mới.",
      // The dialog shows the backend message (e.g. duplicate name) inline.
      suppressGlobalError: true,
    },
    mutationFn: (input: UsageLimitPlanRequest) =>
      usageLimitApi.createPlan(input),
  })
}

type UpdateUsageLimitPlanVariables = {
  input: UsageLimitPlanRequest
  planId: string
}

export function useUpdateUsageLimitPlanMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: usageLimitKeys.plans(),
      successMessage: "Đã cập nhật gói hạn mức.",
      suppressGlobalError: true,
    },
    mutationFn: ({ input, planId }: UpdateUsageLimitPlanVariables) =>
      usageLimitApi.updatePlan(planId, input),
  })
}

export function useDeleteUsageLimitPlanMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: usageLimitKeys.plans(),
      successMessage: "Đã xóa gói hạn mức.",
    },
    mutationFn: (planId: string) => usageLimitApi.deletePlan(planId),
  })
}
