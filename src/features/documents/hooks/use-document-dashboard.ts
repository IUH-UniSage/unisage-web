import { useState } from "react"

import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
import { useDeleteDocumentMutation } from "@/features/documents/queries/use-mutations"
import { useDocumentsQuery } from "@/features/documents/queries/use-queries"
import type { Document } from "@/features/documents/schemas/document-schemas"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"

export const DOCUMENT_PAGE_SIZE = 10

export function useDocumentDashboard() {
  const [page, setPage] = useState(1)
  const documentsQuery = useDocumentsQuery(page, DOCUMENT_PAGE_SIZE)
  const deleteDocument = useDeleteDocumentMutation()
  const { canCreate, canDelete, canUpdate } = useResourcePermissions("document")
  const { canAny } = usePermissions()
  const canProcess = canAny(PERMISSION_POLICIES.ingesterProcessing)

  const [deletingDocument, setDeletingDocument] = useState<Document>()

  const documents = documentsQuery.data?.data ?? []
  const totalItems = documentsQuery.data?.totalItems ?? 0
  const totalPages = Math.max(1, documentsQuery.data?.totalPages ?? 1)

  const requestDelete = (document: Document) => setDeletingDocument(document)

  const closeDeleteDialog = () => setDeletingDocument(undefined)

  const confirmDelete = async () => {
    if (!deletingDocument) return

    await deleteDocument.mutateAsync(deletingDocument.id)
    setDeletingDocument(undefined)

    if (documents.length === 1 && page > 1) {
      setPage(page - 1)
    }
  }

  return {
    canCreate,
    canDelete,
    canProcess,
    canUpdate,
    closeDeleteDialog,
    confirmDelete,
    deletingDocument,
    documents,
    isDeleting: deleteDocument.isPending,
    isPending: documentsQuery.isPending,
    page,
    requestDelete,
    setPage,
    totalItems,
    totalPages,
  }
}
