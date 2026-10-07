import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react"
import { useMemo } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { EntityStatusBadge } from "@/components/shared/list/entity-status-badge"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { ACCESS_LEVEL_PAGE_SIZE } from "@/features/access-level/hooks/use-access-level-dashboard"
import type { AccessLevel } from "@/features/access-level/schemas/access-level-schemas"
import { formatAuditDate } from "@/utils/date-format"

type AccessLevelActionsProps = {
  accessLevel: AccessLevel
  canDelete: boolean
  canUpdate: boolean
  onEdit: (accessLevel: AccessLevel) => void
  onRequestDelete: (accessLevel: AccessLevel) => void
}

function AccessLevelActions({
  accessLevel,
  canDelete,
  canUpdate,
  onEdit,
  onRequestDelete,
}: AccessLevelActionsProps) {
  if (!canUpdate && !canDelete) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Hành động cho cấp độ ${accessLevel.level}`}
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canUpdate ? (
          <DropdownMenuItem onSelect={() => onEdit(accessLevel)}>
            <Pencil aria-hidden="true" />
            Chỉnh sửa
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <DropdownMenuItem
            onSelect={() => onRequestDelete(accessLevel)}
            variant="destructive"
          >
            <Trash2 aria-hidden="true" />
            Xóa
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type AccessLevelListProps = {
  accessLevels: AccessLevel[]
  canDelete: boolean
  canUpdate: boolean
  currentPage: number
  onEdit: (accessLevel: AccessLevel) => void
  onPageChange: (page: number) => void
  onRequestDelete: (accessLevel: AccessLevel) => void
  onSearchChange: (value: string) => void
  search: string
  totalItems: number
  totalPages: number
}

export function AccessLevelList({
  accessLevels,
  canDelete,
  canUpdate,
  currentPage,
  onEdit,
  onPageChange,
  onRequestDelete,
  onSearchChange,
  search,
  totalItems,
  totalPages,
}: AccessLevelListProps) {
  const firstRowNumber = (currentPage - 1) * ACCESS_LEVEL_PAGE_SIZE + 1

  const columns = useMemo<ColumnDef<AccessLevel, unknown>[]>(
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
        cell: ({ row }) => (
          <p className="font-semibold">Cấp {row.original.level}</p>
        ),
        header: "Cấp độ",
        id: "level",
      },
      {
        cell: ({ row }) =>
          row.original.description || (
            <span className="text-muted-foreground">Không có mô tả</span>
          ),
        header: "Mô tả",
        id: "description",
      },
      {
        cell: ({ row }) => (
          <EntityStatusBadge isActive={row.original.isActive} />
        ),
        header: "Trạng thái",
        id: "status",
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
          <AccessLevelActions
            accessLevel={row.original}
            canDelete={canDelete}
            canUpdate={canUpdate}
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
          />
        ),
        header: "Hành động",
        id: "actions",
        meta: { className: "text-right", headerClassName: "text-right" },
      },
    ],
    [canDelete, canUpdate, firstRowNumber, onEdit, onRequestDelete]
  )

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="border-b p-3 md:p-4">
        <div className="relative max-w-sm">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Tìm cấp độ truy cập"
            className="pl-9"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo cấp độ hoặc mô tả..."
            value={search}
          />
        </div>
      </div>

      {accessLevels.length ? (
        <div className="hidden md:block">
          <DataTable
            columns={columns}
            data={accessLevels}
            getRowId={(accessLevel) => accessLevel.id}
          />
        </div>
      ) : null}

      {accessLevels.length ? (
        <div
          {...tourAnchor(TOUR_ANCHORS.mobileList)}
          className="grid gap-3 p-3 md:hidden"
        >
          {accessLevels.map((accessLevel, index) => (
            <article className="rounded-xl border p-4" key={accessLevel.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    #{firstRowNumber + index}
                  </p>
                  <p className="font-semibold">Cấp {accessLevel.level}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {accessLevel.description || "Không có mô tả"}
                  </p>
                </div>
                <AccessLevelActions
                  accessLevel={accessLevel}
                  canDelete={canDelete}
                  canUpdate={canUpdate}
                  onEdit={onEdit}
                  onRequestDelete={onRequestDelete}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                <div className="text-xs text-muted-foreground">
                  <p>{accessLevel.createdByName || "System"}</p>
                  <p className="mt-1">
                    {formatAuditDate(accessLevel.createdAt)}
                  </p>
                </div>
                <EntityStatusBadge isActive={accessLevel.isActive} />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!accessLevels.length ? (
        <SearchEmpty
          description="Thử thay đổi từ khóa tìm kiếm."
          title="Không tìm thấy cấp độ truy cập phù hợp"
        />
      ) : null}

      <Pagination
        className="rounded-none border-x-0 border-b-0 shadow-none"
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageSize={ACCESS_LEVEL_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  )
}
