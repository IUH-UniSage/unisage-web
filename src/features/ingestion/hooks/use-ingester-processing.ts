import { useState } from "react"

import { DOCUMENT_PAGE_SIZE } from "@/features/documents/hooks/use-document-dashboard"
import { useDocumentsQuery } from "@/features/documents/queries/use-queries"

export function useIngesterProcessing() {
  const [page, setPage] = useState(1)
  const documentsQuery = useDocumentsQuery(page, DOCUMENT_PAGE_SIZE)

  // Client-side filter: GET /documents has no server-side status filter yet
  // (same accepted limitation document-list.tsx's TODO already notes) - the
  // Processing queue just hides COMPLETED documents out of the fetched page.
  const documents = (documentsQuery.data?.data ?? []).filter(
    (document) => document.status !== "COMPLETED"
  )
  const totalItems = documentsQuery.data?.totalItems ?? 0
  const totalPages = Math.max(1, documentsQuery.data?.totalPages ?? 1)

  return {
    documents,
    isPending: documentsQuery.isPending,
    page,
    setPage,
    totalItems,
    totalPages,
  }
}
