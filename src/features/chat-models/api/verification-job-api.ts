import {
  type VerificationJob,
  verificationJobPageSchema,
  type VerificationJobPage,
  verificationJobSchema,
} from "@/features/chat-models/schemas/verification-job-schemas"
import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { readSuccessData } from "@/utils/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/utils/api-response"

export const verificationJobApi = {
  async getVerificationJob(jobId: string): Promise<VerificationJob> {
    const response = await httpClient.get<ApiResponse<VerificationJob>>(
      API_ENDPOINTS.chatModels.verificationJob(jobId)
    )

    return readSuccessData(response.data, verificationJobSchema)
  },

  async getVerificationJobs(
    page: number,
    limit: number,
    filters?: { chatModelId?: string; status?: string }
  ): Promise<VerificationJobPage> {
    const response = await httpClient.get<ApiResponse<VerificationJobPage>>(
      API_ENDPOINTS.chatModels.verificationJobs,
      {
        params: {
          chatModelId: filters?.chatModelId,
          page: page - 1,
          size: limit,
          status: filters?.status,
        },
      }
    )

    return readSuccessData(response.data, verificationJobPageSchema)
  },
}
