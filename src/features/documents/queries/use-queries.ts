import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { documentOptions } from "@/features/documents/queries/options"

export function useDocumentsQuery(page: number, limit: number) {
  return useQuery({
    ...documentOptions.list(page, limit),
    placeholderData: keepPreviousData,
  })
}
