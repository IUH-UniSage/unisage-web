import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import {
  chatModelApi,
  type ChatModelsParams,
} from "@/features/chat-models/api/chat-model-api"
import { verificationJobApi } from "@/features/chat-models/api/verification-job-api"
import {
  chatModelKeys,
  verificationJobKeys,
} from "@/features/chat-models/queries/keys"

export const chatModelOptions = {
  list: (params: ChatModelsParams) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => chatModelApi.getChatModels(params),
      queryKey: chatModelKeys.list(params),
    }),
}

export const verificationJobOptions = {
  detail: (jobId: string) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => verificationJobApi.getVerificationJob(jobId),
      queryKey: verificationJobKeys.detail(jobId),
    }),
  list: (
    page: number,
    limit: number,
    filters?: { chatModelId?: string; status?: string }
  ) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () =>
        verificationJobApi.getVerificationJobs(page, limit, filters),
      queryKey: verificationJobKeys.list(page, limit, filters),
    }),
}
