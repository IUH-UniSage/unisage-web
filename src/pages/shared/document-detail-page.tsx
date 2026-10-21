import { useLocation, useNavigate, useParams } from "react-router-dom"

import {
  adminDocumentEditPath,
  adminDocumentIngestWizardPath,
  ingesterDocumentEditPath,
  ingesterIngestWizardPath,
  ROUTES,
} from "@/constants/paths"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
import { DocumentDetailDialog } from "@/features/documents/components/document-detail-dialog"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"

export function DocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { canUpdate } = useResourcePermissions("document")
  const { canAny } = usePermissions()
  const canProcess = canAny(PERMISSION_POLICIES.ingesterProcessing)

  const isAdmin = location.pathname.startsWith(ROUTES.admin)
  const listPath = isAdmin ? ROUTES.adminDocuments : ROUTES.ingesterDocuments
  const editPath = isAdmin ? adminDocumentEditPath : ingesterDocumentEditPath
  const wizardPath = isAdmin
    ? adminDocumentIngestWizardPath
    : ingesterIngestWizardPath

  return (
    <DocumentDetailDialog
      canUpdate={canUpdate}
      documentId={documentId}
      onEdit={(document) => navigate(editPath(document.id))}
      onOpenChange={(open) => {
        if (!open) navigate(listPath)
      }}
      onReprocess={
        canProcess
          ? (document) => navigate(wizardPath(document.id, { restart: true }))
          : undefined
      }
    />
  )
}
