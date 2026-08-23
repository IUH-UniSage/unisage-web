import { Plus } from "lucide-react"

import { BulkStatusDialog } from "@/components/shared/dialog/bulk-status-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserDetailDialog } from "@/features/users/components/user-detail-dialog"
import { UserDialog } from "@/features/users/components/user-dialog"
import { UserList } from "@/features/users/components/user-list"
import { UserStatusDialog } from "@/features/users/components/user-status-dialog"
import { useUserDashboard } from "@/features/users/hooks/use-user-dashboard"
import { useAccessRolesQuery } from "@/features/rbac/queries/use-queries"

export function UserDashboard() {
  const dashboard = useUserDashboard()
  const rolesQuery = useAccessRolesQuery()

  const roles = rolesQuery.data?.data ?? []

  if (dashboard.isPending) {
    return <UserSkeleton />
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
              Quản trị · Người dùng
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">
              Danh sách người dùng
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Quản lý tài khoản, vai trò và phòng ban của người dùng trong hệ
              thống UniSage.
            </p>
          </div>

          {dashboard.canCreate ? (
            <Button className="sm:self-end" onClick={dashboard.openCreate}>
              <Plus aria-hidden="true" />
              Thêm người dùng
            </Button>
          ) : null}
        </div>

        <UserList
          canDelete={dashboard.canDelete}
          canUpdate={dashboard.canUpdate}
          currentPage={dashboard.page}
          isBulkUpdating={dashboard.isBulkUpdating}
          isFiltered={dashboard.isFiltered}
          onApplyFilters={dashboard.applyFilters}
          onBulkClear={dashboard.clearSelection}
          onBulkDeactivate={() => dashboard.requestBulkAction("deactivate")}
          onBulkRecover={() => dashboard.requestBulkAction("recover")}
          onDetail={dashboard.openDetail}
          onEdit={dashboard.openEdit}
          onPageChange={dashboard.setPage}
          onResetFilters={dashboard.resetFilters}
          onSearchChange={dashboard.setSearch}
          onStatusChange={dashboard.setStatusFilter}
          onStatusRequest={dashboard.requestStatusChange}
          onToggleAllSelection={dashboard.toggleAllOnPage}
          onToggleSelection={dashboard.toggleSelection}
          search={dashboard.search}
          selectedIds={dashboard.selectedIds}
          status={dashboard.statusFilter}
          totalItems={dashboard.filteredCount}
          totalPages={dashboard.totalPages}
          users={dashboard.pagedUsers}
        />
      </div>

      {dashboard.viewingUser ? (
        <UserDetailDialog
          canUpdate={dashboard.canUpdate}
          onEdit={dashboard.openEdit}
          onOpenChange={(open) => {
            if (!open) dashboard.closeDetail()
          }}
          open
          user={dashboard.viewingUser}
        />
      ) : null}

      {dashboard.isDialogOpen ? (
        <UserDialog
          isSaving={dashboard.isSaving}
          onOpenChange={(open) => {
            if (!open) dashboard.closeDialog()
          }}
          onSubmit={dashboard.save}
          open
          roles={roles}
          user={dashboard.editingUser}
        />
      ) : null}

      {dashboard.statusUser ? (
        <UserStatusDialog
          isSubmitting={dashboard.isUpdatingStatus}
          onConfirm={dashboard.confirmStatusChange}
          onOpenChange={(open) => {
            if (!open) dashboard.closeStatusDialog()
          }}
          user={dashboard.statusUser}
        />
      ) : null}

      {dashboard.pendingBulkAction ? (
        <BulkStatusDialog
          action={dashboard.pendingBulkAction}
          assignedToNoun="tài liệu và quyền hạn"
          count={dashboard.pendingBulkCount}
          entityNoun="người dùng"
          isSubmitting={dashboard.isBulkUpdating}
          onConfirm={dashboard.confirmBulkAction}
          onOpenChange={(open) => {
            if (!open) dashboard.closeBulkActionDialog()
          }}
        />
      ) : null}
    </>
  )
}

function UserSkeleton() {
  return (
    <div className="space-y-5" aria-label="Đang tải danh sách người dùng">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-[520px] max-w-full" />
      </div>
      <Skeleton className="h-[480px] rounded-xl" />
    </div>
  )
}
