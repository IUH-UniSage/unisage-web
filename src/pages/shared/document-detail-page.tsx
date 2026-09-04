import { useLocation, useNavigate, useParams } from "react-router-dom"

import {
  adminDocumentEditPath,
  ingesterDocumentEditPath,
  ROUTES,
} from "@/constants/paths"
import { DocumentDetailDialog } from "@/features/documents/components/document-detail-dialog"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"

export function DocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { canUpdate } = useResourcePermissions("document")

  const isAdmin = location.pathname.startsWith(ROUTES.admin)
  const listPath = isAdmin ? ROUTES.adminDocuments : ROUTES.ingesterDocuments
  const editPath = isAdmin ? adminDocumentEditPath : ingesterDocumentEditPath

  return (
    <DocumentDetailDialog
      canUpdate={canUpdate}
      documentId={documentId}
      onEdit={(document) => navigate(editPath(document.id))}
      onOpenChange={(open) => {
        if (!open) navigate(listPath)
      }}
    />
  )
}
