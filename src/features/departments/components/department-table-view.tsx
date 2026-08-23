import type { ColumnDef } from "@tanstack/react-table"
import { Building, FolderTree, Plus } from "lucide-react"
import { useMemo } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { EntityActionsMenu } from "@/components/shared/list/entity-actions-menu"
import { EntityStatusBadge } from "@/components/shared/list/entity-status-badge"
import { Badge } from "@/components/ui/badge"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import type { Department } from "@/features/departments/schemas/department-schemas"
import {
  getDepthLevelStyle,
  type FlattenedDepartmentNode,
} from "@/features/departments/utils/tree"
import { cn } from "@/lib/utils"
import { formatAuditDate } from "@/utils/date-format"

type DepartmentActionsProps = {
  canCreate: boolean
  canDelete: boolean
  canUpdate: boolean
  department: Department
  onAddChild: (parentId: string) => void
  onDetail: (department: Department) => void
  onEdit: (department: Department) => void
  onStatusRequest: (department: Department) => void
}

function TableDepartmentActions({
  canCreate,
  canDelete,
  canUpdate,
  department,
  onAddChild,
  onDetail,
  onEdit,
  onStatusRequest,
}: DepartmentActionsProps) {
  const isActive = department.isActive ?? true

  return (
    <EntityActionsMenu
      canDelete={canDelete}
      canUpdate={canUpdate}
      entityLabel={department.name}
      isActive={isActive}
      onDetail={() => onDetail(department)}
      onEdit={() => onEdit(department)}
      onStatusRequest={() => onStatusRequest(department)}
    >
      {canCreate ? (
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation()
            onAddChild(department.id)
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          <span>Thêm đơn vị trực thuộc</span>
        </DropdownMenuItem>
      ) : null}
    </EntityActionsMenu>
  )
}

type DepartmentTableViewProps = {
  canCreate: boolean
  canDelete: boolean
  canUpdate: boolean
  items: FlattenedDepartmentNode[]
  onAddChild: (parentId: string) => void
  onDetail: (department: Department) => void
  onEdit: (department: Department) => void
  onStatusRequest: (department: Department) => void
}

export function DepartmentTableView({
  canCreate,
  canDelete,
  canUpdate,
  items,
  onAddChild,
  onDetail,
  onEdit,
  onStatusRequest,
}: DepartmentTableViewProps) {
  const columns = useMemo<ColumnDef<FlattenedDepartmentNode, unknown>[]>(
    () => [
      {
        cell: ({ row }) => row.index + 1,
        header: "STT",
        id: "stt",
        meta: {
          className: "text-sm text-muted-foreground",
          headerClassName: "w-10",
        },
      },
      {
        cell: ({ row }) => {
          const depth = row.original.depth
          const isRoot = depth === 0
          const palette = getDepthLevelStyle(row.original.depth)

          return (
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${depth * 20}px` }}
            >
              {depth > 0 ? (
                <span className="text-xs text-muted-foreground/60 select-none">
                  └─
                </span>
              ) : null}

              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-md",
                  palette.icon
                )}
              >
                <Building className="size-3.5" aria-hidden="true" />
              </span>

              <div className="min-w-0">
                <span
                  className={cn(
                    "block truncate font-medium",
                    isRoot
                      ? "font-semibold text-foreground"
                      : "text-foreground/90"
                  )}
                >
                  {row.original.name}
                </span>
                {row.original.description ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {row.original.description}
                  </span>
                ) : null}
              </div>
            </div>
          )
        },
        header: "Tên phòng ban",
        id: "name",
      },
      {
        cell: ({ row }) => {
          const palette = getDepthLevelStyle(row.original.depth)
          return (
            <Badge
              variant="outline"
              className={cn(palette.border, palette.icon)}
            >
              {palette.label}
            </Badge>
          )
        },
        header: "Loại đơn vị",
        id: "category",
        meta: {
          className: "text-center w-36",
          headerClassName: "text-center w-36",
        },
      },
      {
        cell: ({ row }) =>
          row.original.parentName ? (
            <span className="text-xs font-medium text-muted-foreground">
              {row.original.parentName}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/50">—</span>
          ),
        header: "Trực thuộc",
        id: "parentName",
      },
      {
        cell: ({ row }) => {
          const count = row.original.children?.length ?? 0
          if (!count)
            return <span className="text-xs text-muted-foreground/50">0</span>
          return (
            <Badge variant="outline" className="gap-1 text-xs">
              <FolderTree className="size-3" aria-hidden="true" />
              <span>{count} đơn vị</span>
            </Badge>
          )
        },
        header: "Đơn vị trực thuộc",
        id: "childrenCount",
        meta: {
          className: "text-center w-36",
          headerClassName: "text-center w-36",
        },
      },
      {
        cell: ({ row }) => (
          <EntityStatusBadge isActive={row.original.isActive ?? true} />
        ),
        header: "Trạng thái",
        id: "status",
        meta: {
          className: "text-center w-32",
          headerClassName: "text-center w-32",
        },
      },
      {
        cell: ({ row }) => formatAuditDate(row.original.createdAt),
        header: "Ngày tạo",
        id: "createdAt",
        meta: { className: "text-sm text-muted-foreground w-32" },
      },
      {
        cell: ({ row }) => (
          <TableDepartmentActions
            canCreate={canCreate}
            canDelete={canDelete}
            canUpdate={canUpdate}
            department={row.original as Department}
            onAddChild={onAddChild}
            onDetail={onDetail}
            onEdit={onEdit}
            onStatusRequest={onStatusRequest}
          />
        ),
        header: "Hành động",
        id: "actions",
        meta: { className: "text-right", headerClassName: "text-right" },
      },
    ],
    [
      canCreate,
      canDelete,
      canUpdate,
      onAddChild,
      onDetail,
      onEdit,
      onStatusRequest,
    ]
  )

  return (
    <DataTable columns={columns} data={items} getRowId={(dept) => dept.id} />
  )
}
