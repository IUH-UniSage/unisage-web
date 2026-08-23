import { Plus } from "lucide-react"

import { EntityStatusDialog } from "@/components/shared/dialog/entity-status-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryDialog } from "@/features/categories/components/category-dialog"
import { CategoryList } from "@/features/categories/components/category-list"
import { useCategoryDashboard } from "@/features/categories/hooks/use-category-dashboard"

export function CategoryDashboard() {
  const dashboard = useCategoryDashboard()

  if (dashboard.isPending) {
    return <CategorySkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Nội dung
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">
            Danh sách danh mục tài liệu
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Quản lý các danh mục dùng để phân loại tài liệu trong hệ thống.
          </p>
        </div>

        {dashboard.canCreate ? (
          <Button className="sm:self-end" onClick={dashboard.openCreate}>
            <Plus aria-hidden="true" />
            Thêm danh mục mới
          </Button>
        ) : null}
      </div>

      <CategoryList
        canDelete={dashboard.canDelete}
        canUpdate={dashboard.canUpdate}
        categories={dashboard.pagedCategories}
        currentPage={dashboard.page}
        onEdit={dashboard.openEdit}
        onPageChange={dashboard.setPage}
        onRequestDeactivate={dashboard.requestDeactivate}
        onSearchChange={dashboard.setSearch}
        onStatusFilterChange={dashboard.setStatusFilter}
        search={dashboard.search}
        statusFilter={dashboard.statusFilter}
        totalItems={dashboard.filteredCount}
        totalPages={dashboard.totalPages}
      />

      {dashboard.isDialogOpen ? (
        <CategoryDialog
          category={dashboard.editingCategory}
          isSaving={dashboard.isSaving}
          onOpenChange={(open) => {
            if (!open) dashboard.closeDialog()
          }}
          onSubmit={dashboard.save}
          open
        />
      ) : null}

      {dashboard.deactivatingCategory ? (
        <EntityStatusDialog
          assignedToNoun="tài liệu"
          entityLabel={dashboard.deactivatingCategory.name}
          entityNoun="danh mục"
          isActive
          isSubmitting={dashboard.isDeactivating}
          onConfirm={dashboard.confirmDeactivate}
          onOpenChange={(open) => {
            if (!open) dashboard.closeDeactivateDialog()
          }}
        />
      ) : null}
    </div>
  )
}

function CategorySkeleton() {
  return (
    <div className="space-y-5" aria-label="Đang tải danh sách danh mục">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-155 max-w-full" />
      </div>
      <Skeleton className="h-[420px] rounded-xl" />
    </div>
  )
}
