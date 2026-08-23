import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { documentOptions } from "@/features/documents/queries/options"

export function useDocumentQuery(id: string | undefined) {
  return useQuery({
    ...documentOptions.detail(id ?? ""),
    enabled: Boolean(id),
  })
}

export function useDocumentsQuery(page: number, limit: number) {
  return useQuery({
    ...documentOptions.list(page, limit),
    placeholderData: keepPreviousData,
  })
}
