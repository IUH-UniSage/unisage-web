import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import {
  chatModelApi,
  type ChatModelsParams,
} from "@/features/chat-models/api/chat-model-api"
import { embeddingIndexApi } from "@/features/chat-models/api/embedding-index-api"
import { verificationJobApi } from "@/features/chat-models/api/verification-job-api"
import {
  chatModelKeys,
  embeddingIndexKeys,
  verificationJobKeys,
} from "@/features/chat-models/queries/keys"
import { isOpenReindexRun } from "@/features/chat-models/schemas/embedding-index-schemas"

// How often an open re-index's progress is refreshed.
export const EMBEDDING_REINDEX_POLL_MS = 3000

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

export const embeddingIndexOptions = {
  detail: () =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      queryFn: () => embeddingIndexApi.getEmbeddingIndex(),
      queryKey: embeddingIndexKeys.all,
      // Polls only while a run is open; a finished run stops it.
      refetchInterval: (query) =>
        isOpenReindexRun(query.state.data?.currentRun)
          ? EMBEDDING_REINDEX_POLL_MS
          : false,
    }),
}
