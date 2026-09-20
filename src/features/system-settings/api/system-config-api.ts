import {
  systemConfigListSchema,
  systemConfigSchema,
  updateSystemConfigRequestSchema,
  type SystemConfig,
  type SystemConfigCategory,
  type UpdateSystemConfigRequest,
} from "@/features/system-settings/schemas/system-config-schemas"
import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { readSuccessData } from "@/utils/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/utils/api-response"

export const systemConfigApi = {
  async getSystemConfigs(
    category?: SystemConfigCategory
  ): Promise<SystemConfig[]> {
    const response = await httpClient.get<ApiResponse<SystemConfig[]>>(
      API_ENDPOINTS.systemConfigs.systemConfigs,
      { params: { category } }
    )

    return readSuccessData(response.data, systemConfigListSchema)
  },

  async updateSystemConfig(
    configKey: string,
    input: UpdateSystemConfigRequest
  ): Promise<SystemConfig> {
    const request = updateSystemConfigRequestSchema.parse(input)
    const response = await httpClient.put<ApiResponse<SystemConfig>>(
      API_ENDPOINTS.systemConfigs.systemConfig(configKey),
      request
    )

    return readSuccessData(response.data, systemConfigSchema)
  },
}
