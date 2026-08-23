import { useMutation } from "@tanstack/react-query"

import { documentApi } from "@/features/documents/api/document-api"
import { documentKeys } from "@/features/documents/queries/keys"
import type { DocumentFormValues } from "@/features/documents/schemas/document-schemas"

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

export function useDeleteDocumentMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: documentKeys.all,
      successMessage: "Đã xóa tài liệu.",
    },
    mutationFn: (documentId: string) => documentApi.deleteDocument(documentId),
  })
}
