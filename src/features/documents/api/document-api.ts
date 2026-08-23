import { z } from "zod"

import {
  documentPageSchema,
  documentSchema,
  type Document,
  type DocumentFormValues,
  type DocumentPage,
} from "@/features/documents/schemas/document-schemas"
import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import { httpClient } from "@/lib/axios-client"
import type { ApiResponse } from "@/utils/api-response"

function toFormData(input: DocumentFormValues): FormData {
  const formData = new FormData()

  if (input.departmentId) formData.append("docPackageId", input.departmentId)
  if (input.categoryId) formData.append("categoryId", input.categoryId)
  formData.append("title", input.title)
  if (input.sourceUrl) formData.append("sourceUrl", input.sourceUrl)
  formData.append("fileType", input.fileType)
  if (input.minAccessLevelId) {
    formData.append("minAccessLevelId", input.minAccessLevelId)
  }
  formData.append("isPublic", String(input.isPublic))
  if (input.file) formData.append("file", input.file)

  return formData
}

export const documentApi = {
  async createDocument(input: DocumentFormValues): Promise<Document> {
    const response = await httpClient.post<ApiResponse<Document>>(
      API_ENDPOINTS.documents.documents,
      toFormData(input),
      { headers: { "Content-Type": undefined } }
    )

    return readSuccessData(response.data, documentSchema)
  },

  async deleteDocument(documentId: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.documents.document(documentId)
    )

    readApiResponse(response.data, z.null())
  },

  async getDocuments(page: number, limit: number): Promise<DocumentPage> {
    const response = await httpClient.get<ApiResponse<DocumentPage>>(
      API_ENDPOINTS.documents.documents,
      { params: { limit, page } }
    )

    return readSuccessData(response.data, documentPageSchema)
  },

  async updateDocument(
    documentId: string,
    input: DocumentFormValues
  ): Promise<Document> {
    const response = await httpClient.put<ApiResponse<Document>>(
      API_ENDPOINTS.documents.document(documentId),
      toFormData(input),
      { headers: { "Content-Type": undefined } }
    )

    return readSuccessData(response.data, documentSchema)
  },
}
