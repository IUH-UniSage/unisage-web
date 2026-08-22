import { Plus } from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/shared/dialog/confirm-delete-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AccessLevelDialog } from "@/features/access-level/components/access-level-dialog"
import { AccessLevelList } from "@/features/access-level/components/access-level-list"
import { useAccessLevelDashboard } from "@/features/access-level/hooks/use-access-level-dashboard"

export function AccessLevelDashboard() {
  const dashboard = useAccessLevelDashboard()

  if (dashboard.isPending) {
    return <AccessLevelSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Phân quyền
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">
            Danh sách cấp độ truy cập
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Quản lý các ngưỡng cấp độ dùng để giới hạn quyền truy cập tài liệu
            và quyền hạn trong hệ thống.
          </p>
        </div>

        {dashboard.canCreate ? (
          <Button className="sm:self-end" onClick={dashboard.openCreate}>
            <Plus aria-hidden="true" />
            Thêm cấp độ mới
          </Button>
        ) : null}
      </div>

      <AccessLevelList
        accessLevels={dashboard.pagedAccessLevels}
        canDelete={dashboard.canDelete}
        canUpdate={dashboard.canUpdate}
        currentPage={dashboard.page}
        onEdit={dashboard.openEdit}
        onPageChange={dashboard.setPage}
        onRequestDelete={dashboard.requestDelete}
        onSearchChange={dashboard.setSearch}
        search={dashboard.search}
        totalItems={dashboard.filteredCount}
        totalPages={dashboard.totalPages}
      />

      {dashboard.isDialogOpen ? (
        <AccessLevelDialog
          accessLevel={dashboard.editingAccessLevel}
          isSaving={dashboard.isSaving}
          onOpenChange={(open) => {
            if (!open) dashboard.closeDialog()
          }}
          onSubmit={dashboard.save}
          open
        />
      ) : null}

      {dashboard.deletingAccessLevel ? (
        <ConfirmDeleteDialog
          description={`Cấp ${dashboard.deletingAccessLevel.level} sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
          entityLabel="cấp độ"
          isSubmitting={dashboard.isDeleting}
          onConfirm={dashboard.confirmDelete}
          onOpenChange={(open) => {
            if (!open) dashboard.closeDeleteDialog()
          }}
          title={`Xóa cấp ${dashboard.deletingAccessLevel.level}?`}
        />
      ) : null}
    </div>
  )
}

function AccessLevelSkeleton() {
  return (
    <div className="space-y-5" aria-label="Đang tải danh sách cấp độ truy cập">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-155 max-w-full" />
      </div>
      <Skeleton className="h-[420px] rounded-xl" />
    </div>
  )
}
