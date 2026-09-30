import { z } from "zod"

import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
  myUsageSchema,
  usageLimitPlanListSchema,
  usageLimitPlanRequestSchema,
  usageLimitPlanSchema,
  type MyUsage,
  type UsageLimitPlan,
  type UsageLimitPlanList,
  type UsageLimitPlanRequest,
} from "@/features/usage-limits/schemas/usage-limit-schemas"
import { httpClient } from "@/lib/axios-client"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import type { ApiResponse } from "@/utils/api-response"

export const usageLimitApi = {
  async createPlan(input: UsageLimitPlanRequest): Promise<UsageLimitPlan> {
    const request = usageLimitPlanRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<UsageLimitPlan>>(
      API_ENDPOINTS.usageLimitPlans.plans,
      request
    )

    return readSuccessData(response.data, usageLimitPlanSchema)
  },

  async deletePlan(planId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.usageLimitPlans.plan(planId)
    )

    readApiResponse(response.data, z.null())
  },

  async getMyUsage(): Promise<MyUsage> {
    const response = await httpClient.get<ApiResponse<MyUsage>>(
      API_ENDPOINTS.usageLimits.me
    )

    return readSuccessData(response.data, myUsageSchema)
  },

  async getPlans(): Promise<UsageLimitPlanList> {
    const response = await httpClient.get<ApiResponse<UsageLimitPlanList>>(
      API_ENDPOINTS.usageLimitPlans.plans
    )

    return readSuccessData(response.data, usageLimitPlanListSchema)
  },

  async getUserUsage(userId: string): Promise<MyUsage> {
    const response = await httpClient.get<ApiResponse<MyUsage>>(
      API_ENDPOINTS.users.userUsageLimit(userId)
    )

    return readSuccessData(response.data, myUsageSchema)
  },

  async updatePlan(
    planId: string,
    input: UsageLimitPlanRequest
  ): Promise<UsageLimitPlan> {
    const request = usageLimitPlanRequestSchema.parse(input)
    const response = await httpClient.put<ApiResponse<UsageLimitPlan>>(
      API_ENDPOINTS.usageLimitPlans.plan(planId),
      request
    )

    return readSuccessData(response.data, usageLimitPlanSchema)
  },
}
