import { Plus } from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { ConfirmDeleteDialog } from "@/components/shared/dialog/confirm-delete-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  adminDocumentDetailPath,
  adminDocumentEditPath,
  adminDocumentIngestWizardPath,
  adminDocumentNewPath,
  ingesterDocumentDetailPath,
  ingesterDocumentEditPath,
  ingesterDocumentNewPath,
  ingesterIngestWizardPath,
  ROUTES,
} from "@/constants/paths"
import { DocumentList } from "@/features/documents/components/document-list"
import { useDocumentDashboard } from "@/features/documents/hooks/use-document-dashboard"
import { DocumentStatusSync } from "@/features/ingestion"

export function DocumentDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const dashboard = useDocumentDashboard()
  // Live embed-progress percent per document, from <DocumentStatusSync>'s WS
  // "progress" frames - purely a UI overlay on top of the PENDING badge,
  // never persisted (Document.status itself only ever becomes COMPLETED/
  // FAILED on a terminal frame).
  const [progressByDocumentId, setProgressByDocumentId] = useState<
    Record<string, number>
  >({})

  // Quản trị tài liệu is registered in both the system-admin and ingester
  // workspaces (see feature-registry.tsx) - which detail/edit/create paths
  // to link to depends on which workspace this instance is mounted under.
  const isAdmin = location.pathname.startsWith(ROUTES.admin)
  const newPath = isAdmin ? adminDocumentNewPath : ingesterDocumentNewPath
  const detailPath = isAdmin
    ? adminDocumentDetailPath
    : ingesterDocumentDetailPath
  const editPath = isAdmin ? adminDocumentEditPath : ingesterDocumentEditPath
  const wizardPath = isAdmin
    ? adminDocumentIngestWizardPath
    : ingesterIngestWizardPath

  if (dashboard.isPending) {
    return <DocumentSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Nội dung
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">
            Quản trị tài liệu
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Quản lý tài liệu được nạp vào hệ thống, phân loại theo danh mục và
            phòng ban.
          </p>
        </div>

        {dashboard.canCreate ? (
          <Button className="sm:self-end" onClick={() => navigate(newPath())}>
            <Plus aria-hidden="true" />
            Thêm tài liệu mới
          </Button>
        ) : null}
      </div>

      <DocumentList
        canDelete={dashboard.canDelete}
        canProcess={dashboard.canProcess}
        canUpdate={dashboard.canUpdate}
        currentPage={dashboard.page}
        documents={dashboard.documents}
        onEdit={(document) => navigate(editPath(document.id))}
        onPageChange={dashboard.setPage}
        onProcess={(document) => navigate(wizardPath(document.id))}
        onRequestDelete={dashboard.requestDelete}
        onViewDetail={(document) => navigate(detailPath(document.id))}
        progressByDocumentId={progressByDocumentId}
        totalItems={dashboard.totalItems}
        totalPages={dashboard.totalPages}
      />

      <DocumentStatusSync
        documents={dashboard.documents}
        onProgress={(documentId, percent) =>
          setProgressByDocumentId((prev) => ({
            ...prev,
            [documentId]: percent,
          }))
        }
      />

      {dashboard.deletingDocument ? (
        <ConfirmDeleteDialog
          description={`Tài liệu "${dashboard.deletingDocument.title}" sẽ bị gỡ khỏi danh sách và không thể khôi phục qua giao diện.`}
          entityLabel="tài liệu"
          isSubmitting={dashboard.isDeleting}
          onConfirm={dashboard.confirmDelete}
          onOpenChange={(open) => {
            if (!open) dashboard.closeDeleteDialog()
          }}
          title={`Xóa "${dashboard.deletingDocument.title}"?`}
        />
      ) : null}
    </div>
  )
}

function DocumentSkeleton() {
  return (
    <div className="space-y-5" aria-label="Đang tải danh sách tài liệu">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-155 max-w-full" />
      </div>
      <Skeleton className="h-[420px] rounded-xl" />
    </div>
  )
}
