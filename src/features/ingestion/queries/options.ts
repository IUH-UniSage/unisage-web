import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { ingestionApi } from "@/features/ingestion/api/ingestion-api"
import { ingestionKeys } from "@/features/ingestion/queries/keys"

export const ingestionOptions = {
  // realtime (staleTime: 0): another session could be chunking/embedding the
  // same document concurrently - always refetch on open rather than show a
  // stale draft, same rationale as documentOptions.detail's presigned URL.
  // The response carries the live embed `task_state` inline, so this doubles
  // as <DocumentStatusSync>'s reconciliation-sweep read.
  job: (documentId: string) =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      queryFn: () => ingestionApi.getJob(documentId),
      queryKey: ingestionKeys.job(documentId),
    }),
}
