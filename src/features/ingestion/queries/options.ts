import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { ingestionApi } from "@/features/ingestion/api/ingestion-api"
import { ingestionKeys } from "@/features/ingestion/queries/keys"

export const ingestionOptions = {
  // Polled by the Processing queue's background completion watcher, not
  // read once like `job` below - refetchInterval is set by the caller.
  embeddingStatus: (taskId: string) =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      queryFn: () => ingestionApi.getEmbeddingStatus(taskId),
      queryKey: ingestionKeys.embeddingStatus(taskId),
    }),
  // realtime (staleTime: 0): another session could be chunking/embedding the
  // same document concurrently - always refetch on open rather than show a
  // stale draft, same rationale as documentOptions.detail's presigned URL.
  job: (documentId: string) =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      queryFn: () => ingestionApi.getJob(documentId),
      queryKey: ingestionKeys.job(documentId),
    }),
}
