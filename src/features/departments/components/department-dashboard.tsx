import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DepartmentDetailDialog } from "@/features/departments/components/department-detail-dialog"
import { DepartmentDialog } from "@/features/departments/components/department-dialog"
import { DepartmentList } from "@/features/departments/components/department-list"
import { DepartmentStatusDialog } from "@/features/departments/components/department-status-dialog"
import { useDepartmentDashboard } from "@/features/departments/hooks/use-department-dashboard"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"

export function DepartmentDashboard() {
  const dashboard = useDepartmentDashboard()

  if (dashboard.isPending) {
    return <DepartmentSkeleton />
  }

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div {...tourAnchor(TOUR_ANCHORS.pageHeader)}>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Cơ cấu tổ chức
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            Danh sách phòng ban
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Quản lý và theo dõi cấu trúc cây phân cấp các phòng ban, khoa viện
            và đơn vị trực thuộc.
          </p>
        </div>

        {dashboard.canCreate ? (
          <Button
            {...tourAnchor(TOUR_ANCHORS.pageActions)}
            className="gap-2 sm:self-end"
            onClick={() => dashboard.openCreate()}
          >
            <Plus className="size-4" aria-hidden="true" />
            <span>Thêm đơn vị</span>
          </Button>
        ) : null}
      </div>

      {/* Main Department List with View Modes */}
      <DepartmentList
        canCreate={dashboard.canCreate}
        canDelete={dashboard.canDelete}
        canUpdate={dashboard.canUpdate}
        departmentTree={dashboard.departmentTree}
        flattenedList={dashboard.flattenedList}
        isFiltered={dashboard.isFiltered}
        matchedIds={dashboard.matchedIds}
        onAddChild={dashboard.openCreate}
        onApplyFilters={dashboard.applyFilters}
        onDetail={dashboard.openDetail}
        onEdit={dashboard.openEdit}
        onResetFilters={dashboard.resetFilters}
        onSearchChange={dashboard.setSearch}
        onStatusChange={dashboard.setStatusFilter}
        onStatusRequest={dashboard.requestStatusChange}
        onTypeChange={dashboard.setTypeFilter}
        onViewModeChange={dashboard.setViewMode}
        relevantIds={dashboard.relevantIds}
        search={dashboard.search}
        status={dashboard.statusFilter}
        type={dashboard.typeFilter}
        viewMode={dashboard.viewMode}
      />

      {/* View Detail Dialog */}
      {dashboard.viewingDepartment ? (
        <DepartmentDetailDialog
          canCreate={dashboard.canCreate}
          canUpdate={dashboard.canUpdate}
          department={dashboard.viewingDepartment}
          onAddChild={dashboard.openCreate}
          onEdit={dashboard.openEdit}
          onOpenChange={(open) => {
            if (!open) dashboard.closeDetail()
          }}
          open
          tree={dashboard.departmentTree}
        />
      ) : null}

      {/* Create / Edit Form Dialog */}
      {dashboard.isDialogOpen ? (
        <DepartmentDialog
          department={dashboard.editingDepartment}
          isSaving={dashboard.isSaving}
          onOpenChange={(open) => {
            if (!open) dashboard.closeDialog()
          }}
          onSubmit={dashboard.save}
          open
          presetParentId={dashboard.presetParentId}
          tree={dashboard.departmentTree}
        />
      ) : null}

      {/* Status Toggle Confirm Dialog */}
      {dashboard.statusDepartment ? (
        <DepartmentStatusDialog
          department={dashboard.statusDepartment}
          isSubmitting={dashboard.isUpdatingStatus}
          onConfirm={dashboard.confirmStatusChange}
          onOpenChange={(open) => {
            if (!open) dashboard.closeStatusDialog()
          }}
        />
      ) : null}
    </div>
  )
}

function DepartmentSkeleton() {
  return (
    <div className="space-y-5" aria-label="Đang tải danh sách phòng ban">
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-[480px] max-w-full" />
      </div>

      <Skeleton className="h-[480px] rounded-xl" />
    </div>
  )
}
