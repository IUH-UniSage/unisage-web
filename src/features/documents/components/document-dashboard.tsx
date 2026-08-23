import { Plus } from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/shared/dialog/confirm-delete-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DocumentDetailDialog } from "@/features/documents/components/document-detail-dialog"
import { DocumentDialog } from "@/features/documents/components/document-dialog"
import { DocumentList } from "@/features/documents/components/document-list"
import { useDocumentDashboard } from "@/features/documents/hooks/use-document-dashboard"

export function DocumentDashboard() {
  const dashboard = useDocumentDashboard()

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
          <Button className="sm:self-end" onClick={dashboard.openCreate}>
            <Plus aria-hidden="true" />
            Thêm tài liệu mới
          </Button>
        ) : null}
      </div>

      <DocumentList
        canDelete={dashboard.canDelete}
        canUpdate={dashboard.canUpdate}
        currentPage={dashboard.page}
        documents={dashboard.documents}
        onEdit={dashboard.openEdit}
        onPageChange={dashboard.setPage}
        onRequestDelete={dashboard.requestDelete}
        onViewDetail={dashboard.openDocumentDetail}
        totalItems={dashboard.totalItems}
        totalPages={dashboard.totalPages}
      />

      {dashboard.viewingDocumentId ? (
        <DocumentDetailDialog
          canUpdate={dashboard.canUpdate}
          documentId={dashboard.viewingDocumentId}
          onEdit={dashboard.openEdit}
          onOpenChange={(open) => {
            if (!open) dashboard.closeDocumentDetail()
          }}
          open
        />
      ) : null}

      {dashboard.isDialogOpen ? (
        <DocumentDialog
          document={dashboard.editingDocument}
          isSaving={dashboard.isSaving}
          onOpenChange={(open) => {
            if (!open) dashboard.closeDialog()
          }}
          onSubmit={dashboard.save}
          open
        />
      ) : null}

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
