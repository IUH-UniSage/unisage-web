import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { documentChunksApi } from "@/features/documents/api/document-chunks-api"
import { documentKeys } from "@/features/documents/queries/keys"
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

export function useDocumentVersionsQuery(documentId: string | undefined) {
  return useQuery({
    ...documentOptions.versions(documentId ?? ""),
    enabled: Boolean(documentId),
  })
}

export function useIndexedChunksQuery(
  documentId: string | undefined,
  { page = 1, limit = 20 }: { limit?: number; page?: number } = {}
) {
  return useQuery({
    ...documentOptions.indexedChunks(documentId ?? "", page, limit),
    enabled: Boolean(documentId),
    placeholderData: keepPreviousData,
  })
}

export function useDeleteIndexedChunkMutation(documentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (chunkId: string) =>
      documentChunksApi.deleteIndexedChunk(documentId, chunkId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...documentKeys.all, "indexedChunks", documentId],
      })
    },
  })
}
