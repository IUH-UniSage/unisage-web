import { useMutation } from "@tanstack/react-query"

import { documentApi } from "@/features/documents/api/document-api"
import { documentKeys } from "@/features/documents/queries/keys"
import type {
  DocStatus,
  DocumentFormValues,
} from "@/features/documents/schemas/document-schemas"

export function useCreateDocumentMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: documentKeys.all,
      successMessage: "Đã tạo tài liệu mới.",
    },
    mutationFn: (input: DocumentFormValues) =>
      documentApi.createDocument(input),
  })
}

type UpdateDocumentVariables = {
  documentId: string
  input: DocumentFormValues
}

export function useUpdateDocumentMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: documentKeys.all,
      successMessage: "Đã cập nhật tài liệu.",
    },
    mutationFn: ({ documentId, input }: UpdateDocumentVariables) =>
      documentApi.updateDocument(documentId, input),
  })
}

type UpdateDocumentStatusVariables = {
  documentId: string
  status: DocStatus
}

export function useUpdateDocumentStatusMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: documentKeys.all,
      // No toast - this fires automatically at the end of the embed step,
      // not from a user-initiated form submit; the wizard's own progress UI
      // already communicates the outcome.
      suppressGlobalError: true,
    },
    mutationFn: ({ documentId, status }: UpdateDocumentStatusVariables) =>
      documentApi.updateDocumentStatus(documentId, status),
  })
}

export function useDeleteDocumentMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: documentKeys.all,
      successMessage: "Đã xóa tài liệu.",
    },
    mutationFn: (documentId: string) => documentApi.deleteDocument(documentId),
  })
}
