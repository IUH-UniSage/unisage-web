import type { ColumnDef } from "@tanstack/react-table"
import { Search } from "lucide-react"
import { useMemo } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { EntityActionsMenu } from "@/components/shared/list/entity-actions-menu"
import { EntityStatusBadge } from "@/components/shared/list/entity-status-badge"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORY_PAGE_SIZE } from "@/features/categories/hooks/use-category-dashboard"
import type { Category } from "@/features/categories/schemas/category-schemas"
import { formatAuditDate } from "@/utils/date-format"

type StatusFilter = "active" | "all" | "inactive"

type CategoryListProps = {
  canDelete: boolean
  canUpdate: boolean
  categories: Category[]
  currentPage: number
  onEdit: (category: Category) => void
  onPageChange: (page: number) => void
  onRequestDeactivate: (category: Category) => void
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: StatusFilter) => void
  search: string
  statusFilter: StatusFilter
  totalItems: number
  totalPages: number
}

export function CategoryList({
  canDelete,
  canUpdate,
  categories,
  currentPage,
  onEdit,
  onPageChange,
  onRequestDeactivate,
  onSearchChange,
  onStatusFilterChange,
  search,
  statusFilter,
  totalItems,
  totalPages,
}: CategoryListProps) {
  const firstRowNumber = (currentPage - 1) * CATEGORY_PAGE_SIZE + 1

  const columns = useMemo<ColumnDef<Category, unknown>[]>(
    () => [
      {
        cell: ({ row }) => firstRowNumber + row.index,
        header: "STT",
        id: "stt",
        meta: {
          className: "text-sm text-muted-foreground",
          headerClassName: "w-10",
        },
      },
      {
        cell: ({ row }) => <p className="font-semibold">{row.original.name}</p>,
        header: "Tên danh mục",
        id: "name",
      },
      {
        cell: ({ row }) => (
          <p className="line-clamp-2 max-w-sm text-sm text-muted-foreground">
            {row.original.description || "Không có mô tả"}
          </p>
        ),
        header: "Mô tả",
        id: "description",
      },
      {
        cell: ({ row }) => row.original.createdByName || "System",
        header: "Người tạo",
        id: "createdBy",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => formatAuditDate(row.original.createdAt),
        header: "Ngày tạo",
        id: "createdAt",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => (
          <EntityStatusBadge isActive={row.original.isActive} />
        ),
        header: "Trạng thái",
        id: "status",
      },
      {
        cell: ({ row }) => (
          <EntityActionsMenu
            canDelete={canDelete && row.original.isActive}
            canUpdate={canUpdate}
            entityLabel={`danh mục ${row.original.name}`}
            isActive={row.original.isActive}
            onEdit={() => onEdit(row.original)}
            onStatusRequest={() => onRequestDeactivate(row.original)}
          />
        ),
        header: "Hành động",
        id: "actions",
        meta: { className: "text-right", headerClassName: "text-right" },
      },
    ],
    [canDelete, canUpdate, firstRowNumber, onEdit, onRequestDeactivate]
  )

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="flex flex-wrap items-center gap-2 border-b p-3 md:p-4">
        <div className="relative min-w-56 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Tìm danh mục"
            className="pl-9"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tên hoặc mô tả..."
            value={search}
          />
        </div>
        <Select
          onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}
          value={statusFilter}
        >
          <SelectTrigger aria-label="Lọc theo trạng thái" className="w-48">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {categories.length ? (
        <div className="hidden md:block">
          <DataTable
            columns={columns}
            data={categories}
            getRowId={(category) => category.id}
          />
        </div>
      ) : null}

      {categories.length ? (
        <div className="grid gap-3 p-3 md:hidden">
          {categories.map((category, index) => (
            <article className="rounded-xl border p-4" key={category.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    #{firstRowNumber + index}
                  </p>
                  <p className="font-semibold">{category.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {category.description || "Không có mô tả"}
                  </p>
                </div>
                <EntityActionsMenu
                  canDelete={canDelete && category.isActive}
                  canUpdate={canUpdate}
                  entityLabel={`danh mục ${category.name}`}
                  isActive={category.isActive}
                  onEdit={() => onEdit(category)}
                  onStatusRequest={() => onRequestDeactivate(category)}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                <div className="text-xs text-muted-foreground">
                  <p>{category.createdByName || "System"}</p>
                  <p className="mt-1">{formatAuditDate(category.createdAt)}</p>
                </div>
                <EntityStatusBadge isActive={category.isActive} />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!categories.length ? (
        <SearchEmpty
          description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."
          title="Không tìm thấy danh mục phù hợp"
        />
      ) : null}

      <Pagination
        className="rounded-none border-x-0 border-b-0 shadow-none"
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageSize={CATEGORY_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  )
}
