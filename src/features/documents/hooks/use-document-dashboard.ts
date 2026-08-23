import { useState } from "react"

import {
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useUpdateDocumentMutation,
} from "@/features/documents/queries/use-mutations"
import { useDocumentsQuery } from "@/features/documents/queries/use-queries"
import type {
  Document,
  DocumentFormValues,
} from "@/features/documents/schemas/document-schemas"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSIONS } from "@/utils/permissions"

export const DOCUMENT_PAGE_SIZE = 10

export function useDocumentDashboard() {
  const [page, setPage] = useState(1)
  const documentsQuery = useDocumentsQuery(page, DOCUMENT_PAGE_SIZE)
  const createDocument = useCreateDocumentMutation()
  const updateDocument = useUpdateDocumentMutation()
  const deleteDocument = useDeleteDocumentMutation()
  const { can } = usePermissions()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document>()
  const [deletingDocument, setDeletingDocument] = useState<Document>()

  const documents = documentsQuery.data?.data ?? []
  const totalItems = documentsQuery.data?.totalItems ?? 0
  const totalPages = Math.max(1, documentsQuery.data?.totalPages ?? 1)

  const openCreate = () => {
    setEditingDocument(undefined)
    setIsDialogOpen(true)
  }

  const openEdit = (document: Document) => {
    setEditingDocument(document)
    setIsDialogOpen(true)
  }

  const closeDialog = () => setIsDialogOpen(false)

  const save = async (input: DocumentFormValues) => {
    if (editingDocument) {
      await updateDocument.mutateAsync({
        documentId: editingDocument.id,
        input,
      })
    } else {
      await createDocument.mutateAsync(input)
    }

    setIsDialogOpen(false)
  }

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
    canCreate: can(PERMISSIONS.documentCreate),
    canDelete: can(PERMISSIONS.documentDelete),
    canUpdate: can(PERMISSIONS.documentUpdate),
    closeDeleteDialog,
    closeDialog,
    confirmDelete,
    deletingDocument,
    documents,
    editingDocument,
    isDeleting: deleteDocument.isPending,
    isDialogOpen,
    isPending: documentsQuery.isPending,
    isSaving: createDocument.isPending || updateDocument.isPending,
    openCreate,
    openEdit,
    page,
    requestDelete,
    save,
    setPage,
    totalItems,
    totalPages,
  }
}
