import { useQuery } from "@tanstack/react-query"

import { ingestionOptions } from "@/features/ingestion/queries/options"

export function useIngestionJobQuery(documentId: string | undefined) {
  return useQuery({
    ...ingestionOptions.job(documentId ?? ""),
    enabled: Boolean(documentId),
  })
}
