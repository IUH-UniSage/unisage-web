import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/shared/list/data-table"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DOCUMENT_PAGE_SIZE } from "@/features/documents/hooks/use-document-dashboard"
import type { Document } from "@/features/documents/schemas/document-schemas"
import { cn } from "@/lib/utils"
import {
  getDocStatusBadgeClassName,
  getDocStatusLabel,
} from "@/constants/doc-status"
import { formatAuditDate } from "@/utils/date-format"

type DocumentActionsProps = {
  canDelete: boolean
  canUpdate: boolean
  document: Document
  onEdit: (document: Document) => void
  onRequestDelete: (document: Document) => void
}

function DocumentActions({
  canDelete,
  canUpdate,
  document,
  onEdit,
  onRequestDelete,
}: DocumentActionsProps) {
  if (!canUpdate && !canDelete) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Hành động cho tài liệu ${document.title}`}
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canUpdate ? (
          <DropdownMenuItem onSelect={() => onEdit(document)}>
            <Pencil aria-hidden="true" />
            Chỉnh sửa
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <DropdownMenuItem
            onSelect={() => onRequestDelete(document)}
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

type DocumentListProps = {
  canDelete: boolean
  canUpdate: boolean
  currentPage: number
  documents: Document[]
  onEdit: (document: Document) => void
  onPageChange: (page: number) => void
  onRequestDelete: (document: Document) => void
  totalItems: number
  totalPages: number
}

export function DocumentList({
  canDelete,
  canUpdate,
  currentPage,
  documents,
  onEdit,
  onPageChange,
  onRequestDelete,
  totalItems,
  totalPages,
}: DocumentListProps) {
  const firstRowNumber = (currentPage - 1) * DOCUMENT_PAGE_SIZE + 1

  const columns = useMemo<ColumnDef<Document, unknown>[]>(
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
          <div>
            <p className="font-semibold">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.fileType?.toUpperCase() || "—"}
            </p>
          </div>
        ),
        header: "Tiêu đề",
        id: "title",
      },
      {
        cell: ({ row }) => row.original.categoryName || "—",
        header: "Danh mục",
        id: "category",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => row.original.departmentName || "—",
        header: "Phòng ban",
        id: "department",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => (
          <Badge
            className={cn(
              "gap-1.5 px-2.5",
              getDocStatusBadgeClassName(row.original.status)
            )}
            variant="ghost"
          >
            {getDocStatusLabel(row.original.status)}
          </Badge>
        ),
        header: "Trạng thái",
        id: "status",
      },
      {
        cell: ({ row }) => formatAuditDate(row.original.createdAt),
        header: "Ngày tạo",
        id: "createdAt",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => (
          <DocumentActions
            canDelete={canDelete}
            canUpdate={canUpdate}
            document={row.original}
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
      {documents.length ? (
        <div className="hidden md:block">
          <DataTable
            columns={columns}
            data={documents}
            getRowId={(document) => document.id}
          />
        </div>
      ) : null}

      {documents.length ? (
        <div className="grid gap-3 p-3 md:hidden">
          {documents.map((document, index) => (
            <article className="rounded-xl border p-4" key={document.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    #{firstRowNumber + index}
                  </p>
                  <p className="font-semibold">{document.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {document.categoryName || "—"} ·{" "}
                    {document.departmentName || "—"}
                  </p>
                </div>
                <DocumentActions
                  canDelete={canDelete}
                  canUpdate={canUpdate}
                  document={document}
                  onEdit={onEdit}
                  onRequestDelete={onRequestDelete}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  {formatAuditDate(document.createdAt)}
                </p>
                <Badge
                  className={cn(
                    "gap-1.5 px-2.5",
                    getDocStatusBadgeClassName(document.status)
                  )}
                  variant="ghost"
                >
                  {getDocStatusLabel(document.status)}
                </Badge>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!documents.length ? (
        <SearchEmpty
          description="Chưa có tài liệu nào được thêm vào hệ thống."
          title="Không có tài liệu"
        />
      ) : null}

      <Pagination
        className="rounded-none border-x-0 border-b-0 shadow-none"
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageSize={DOCUMENT_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  )
}
