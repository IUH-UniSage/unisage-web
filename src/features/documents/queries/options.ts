import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { documentApi } from "@/features/documents/api/document-api"
import { documentKeys } from "@/features/documents/queries/keys"

export const documentOptions = {
  list: (page: number, limit: number) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => documentApi.getDocuments(page, limit),
      queryKey: documentKeys.list(page, limit),
    }),
}
