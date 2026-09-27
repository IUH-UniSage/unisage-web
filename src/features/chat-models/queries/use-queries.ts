import { useQuery } from "@tanstack/react-query"

import type { ChatModelsParams } from "@/features/chat-models/api/chat-model-api"
import {
  chatModelOptions,
  verificationJobOptions,
} from "@/features/chat-models/queries/options"

export function useChatModelsQuery(params: ChatModelsParams) {
  return useQuery(chatModelOptions.list(params))
}

export function useVerificationJobsQuery(
  page: number,
  limit: number,
  filters?: { chatModelId?: string; status?: string }
) {
  return useQuery(verificationJobOptions.list(page, limit, filters))
}

export function useVerificationJobQuery(jobId: string | undefined) {
  return useQuery({
    ...verificationJobOptions.detail(jobId ?? ""),
    enabled: Boolean(jobId),
  })
}
