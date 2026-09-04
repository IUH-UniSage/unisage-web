import { useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import {
  adminDocumentDetailPath,
  adminDocumentIngestWizardPath,
  ingesterDocumentDetailPath,
  ingesterIngestWizardPath,
  ROUTES,
} from "@/constants/paths"
import { DocumentDialog } from "@/features/documents/components/document-dialog"
import { DocumentUploadSuccessDialog } from "@/features/documents/components/document-upload-success-dialog"
import {
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
} from "@/features/documents/queries/use-mutations"
import { useDocumentQuery } from "@/features/documents/queries/use-queries"
import type {
  Document,
  DocumentFormValues,
} from "@/features/documents/schemas/document-schemas"

export function DocumentFormPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = Boolean(documentId)

  const isAdmin = location.pathname.startsWith(ROUTES.admin)
  const listPath = isAdmin ? ROUTES.adminDocuments : ROUTES.ingesterDocuments
  const detailPath = isAdmin
    ? adminDocumentDetailPath
    : ingesterDocumentDetailPath
  const wizardPath = isAdmin
    ? adminDocumentIngestWizardPath
    : ingesterIngestWizardPath

  const documentQuery = useDocumentQuery(documentId)
  const createDocument = useCreateDocumentMutation()
  const updateDocument = useUpdateDocumentMutation()
  const [uploadedDocument, setUploadedDocument] = useState<Document>()

  if (isEdit && documentQuery.isPending) {
    return (
      <div className="space-y-6" aria-label="Đang tải tài liệu">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (isEdit && !documentQuery.data) {
    return (
      <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
        Không tìm thấy tài liệu.
      </p>
    )
  }

  const cancelPath = isEdit && documentId ? detailPath(documentId) : listPath

  const save = async (input: DocumentFormValues) => {
    if (isEdit && documentId) {
      const updated = await updateDocument.mutateAsync({ documentId, input })
      navigate(detailPath(updated.id))
    } else {
      const created = await createDocument.mutateAsync(input)
      setUploadedDocument(created)
    }
  }

  return (
    <>
      <DocumentDialog
        document={documentQuery.data}
        isSaving={createDocument.isPending || updateDocument.isPending}
        onOpenChange={(open) => {
          if (!open) navigate(cancelPath)
        }}
        onSubmit={save}
      />

      {uploadedDocument ? (
        <DocumentUploadSuccessDialog
          documentTitle={uploadedDocument.title}
          onIngestNow={() => {
            const id = uploadedDocument.id
            setUploadedDocument(undefined)
            navigate(wizardPath(id))
          }}
          onOpenChange={(open) => {
            if (!open) {
              const id = uploadedDocument.id
              setUploadedDocument(undefined)
              navigate(detailPath(id))
            }
          }}
        />
      ) : null}
    </>
  )
}
