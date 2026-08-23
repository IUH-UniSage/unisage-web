import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { documentApi } from "@/features/documents/api/document-api"
import { documentKeys } from "@/features/documents/queries/keys"

export const documentOptions = {
  detail: (id: string) =>
    queryOptions({
      // realtime (staleTime: 0): fileUrl is a MinIO presigned URL that expires
      // after minio.presigned-url-expiry-seconds - always refetch on open
      // rather than risk showing an expired download link from cache.
      ...QUERY_POLICIES.realtime,
      queryFn: () => documentApi.getDocument(id),
      queryKey: documentKeys.detail(id),
    }),
  list: (page: number, limit: number) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => documentApi.getDocuments(page, limit),
      queryKey: documentKeys.list(page, limit),
    }),
}
