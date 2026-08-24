import { useState } from "react"

import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
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
import { useResourcePermissions } from "@/hooks/use-resource-permissions"

export const DOCUMENT_PAGE_SIZE = 10

export function useDocumentDashboard() {
  const [page, setPage] = useState(1)
  const documentsQuery = useDocumentsQuery(page, DOCUMENT_PAGE_SIZE)
  const createDocument = useCreateDocumentMutation()
  const updateDocument = useUpdateDocumentMutation()
  const deleteDocument = useDeleteDocumentMutation()
  const { canCreate, canDelete, canUpdate } = useResourcePermissions("document")
  const { canAny } = usePermissions()
  const canProcess = canAny(PERMISSION_POLICIES.ingesterProcessing)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document>()
  const [deletingDocument, setDeletingDocument] = useState<Document>()
  const [viewingDocumentId, setViewingDocumentId] = useState<string>()
  const [uploadedDocument, setUploadedDocument] = useState<Document>()

  const documents = documentsQuery.data?.data ?? []
  const totalItems = documentsQuery.data?.totalItems ?? 0
  const totalPages = Math.max(1, documentsQuery.data?.totalPages ?? 1)

  const openCreate = () => {
    setViewingDocumentId(undefined)
    setEditingDocument(undefined)
    setIsDialogOpen(true)
  }

  const openEdit = (document: Document) => {
    setViewingDocumentId(undefined)
    setEditingDocument(document)
    setIsDialogOpen(true)
  }

  const closeDialog = () => setIsDialogOpen(false)

  const openDocumentDetail = (document: Document) =>
    setViewingDocumentId(document.id)

  const closeDocumentDetail = () => setViewingDocumentId(undefined)

  const save = async (input: DocumentFormValues) => {
    if (editingDocument) {
      await updateDocument.mutateAsync({
        documentId: editingDocument.id,
        input,
      })
    } else {
      const created = await createDocument.mutateAsync(input)
      setUploadedDocument(created)
    }

    setIsDialogOpen(false)
  }

  const closeUploadSuccessDialog = () => setUploadedDocument(undefined)

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
    closeDialog,
    closeDocumentDetail,
    closeUploadSuccessDialog,
    confirmDelete,
    deletingDocument,
    documents,
    editingDocument,
    isDeleting: deleteDocument.isPending,
    isDialogOpen,
    isPending: documentsQuery.isPending,
    isSaving: createDocument.isPending || updateDocument.isPending,
    openCreate,
    openDocumentDetail,
    openEdit,
    page,
    requestDelete,
    save,
    setPage,
    totalItems,
    totalPages,
    uploadedDocument,
    viewingDocumentId,
  }
}
