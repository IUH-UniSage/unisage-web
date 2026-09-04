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

export function useDocumentChunksQuery(
  documentId: string | undefined,
  { page = 1, limit = 20 }: { limit?: number; page?: number } = {}
) {
  return useQuery({
    ...documentOptions.chunks(documentId ?? "", page, limit),
    enabled: Boolean(documentId),
    placeholderData: keepPreviousData,
  })
}
