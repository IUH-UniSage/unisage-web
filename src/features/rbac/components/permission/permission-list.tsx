import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Power, RotateCcw } from "lucide-react"
import { useMemo } from "react"

import { BulkActionsBar } from "@/components/shared/list/bulk-actions-bar"
import { DataTable } from "@/components/shared/list/data-table"
import { EntityStatusBadge } from "@/components/shared/list/entity-status-badge"
import { ListToolbar } from "@/components/shared/list/list-toolbar"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getResourceTypeBadgeClassName } from "@/constants/resource-types"
import {
  ACCESS_CONTROL_PAGE_SIZE,
  type PermissionLevelFilter,
  type StatusFilter,
} from "@/features/access-control/hooks/use-access-control-dashboard"
import {
  formatAuditDate,
  getPermissionLabel,
  getResourceLabel,
  splitPermissionName,
} from "@/features/access-control/utils/access-control-formatters"
import type { AccessPermission } from "@/features/access-control/schemas/access-control-schemas"

type PermissionActionsProps = {
  canDeletePermissions: boolean
  canUpdatePermissions: boolean
  onEditPermission: (permission: AccessPermission) => void
  onStatusRequest: (permission: AccessPermission) => void
  permission: AccessPermission
}

function PermissionActions({
  canDeletePermissions,
  canUpdatePermissions,
  onEditPermission,
  onStatusRequest,
  permission,
}: PermissionActionsProps) {
  if (!canUpdatePermissions && !canDeletePermissions) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Hành động cho ${permission.name}`}
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canUpdatePermissions ? (
          <DropdownMenuItem onSelect={() => onEditPermission(permission)}>
            <Pencil aria-hidden="true" />
            Chỉnh sửa
          </DropdownMenuItem>
        ) : null}
        {canDeletePermissions ? (
          <DropdownMenuItem
            onSelect={() => onStatusRequest(permission)}
            variant={permission.isActive ? "destructive" : "default"}
          >
            {permission.isActive ? (
              <Power aria-hidden="true" />
            ) : (
              <RotateCcw aria-hidden="true" />
            )}
            {permission.isActive ? "Vô hiệu hóa" : "Khôi phục"}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type PermissionListProps = {
  canDeletePermissions: boolean
  canUpdatePermissions: boolean
  currentPage: number
  isBulkUpdating: boolean
  isFiltered: boolean
  level: PermissionLevelFilter
  onApplyFilters: () => void
  onBulkClear: () => void
  onBulkDeactivate: () => void
  onBulkRecover: () => void
  onEditPermission: (permission: AccessPermission) => void
  onLevelChange: (value: PermissionLevelFilter) => void
  onPageChange: (page: number) => void
  onResetFilters: () => void
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  onStatusRequest: (permission: AccessPermission) => void
  onToggleAllSelection: (permissionIds: string[]) => void
  onToggleSelection: (permissionId: string) => void
  permissions: AccessPermission[]
  search: string
  selectedIds: Set<string>
  status: StatusFilter
  totalItems: number
  totalPages: number
}

export function PermissionList({
  canDeletePermissions,
  canUpdatePermissions,
  currentPage,
  isBulkUpdating,
  isFiltered,
  level,
  onApplyFilters,
  onBulkClear,
  onBulkDeactivate,
  onBulkRecover,
  onEditPermission,
  onLevelChange,
  onPageChange,
  onResetFilters,
  onSearchChange,
  onStatusChange,
  onStatusRequest,
  onToggleAllSelection,
  onToggleSelection,
  permissions,
  search,
  selectedIds,
  status,
  totalItems,
  totalPages,
}: PermissionListProps) {
  const permissionIdsOnPage = permissions.map((permission) => permission.id)
  const allSelectedOnPage =
    permissionIdsOnPage.length > 0 &&
    permissionIdsOnPage.every((id) => selectedIds.has(id))
  const firstRowNumber = (currentPage - 1) * ACCESS_CONTROL_PAGE_SIZE + 1

  const columns = useMemo<ColumnDef<AccessPermission, unknown>[]>(
    () => [
      {
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Chọn ${row.original.name}`}
            checked={selectedIds.has(row.original.id)}
            onCheckedChange={() => onToggleSelection(row.original.id)}
          />
        ),
        header: () => (
          <Checkbox
            aria-label="Chọn tất cả quyền hạn trong trang"
            checked={allSelectedOnPage}
            onCheckedChange={() => onToggleAllSelection(permissionIdsOnPage)}
          />
        ),
        id: "select",
        meta: { className: "w-10", headerClassName: "w-10" },
      },
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
        header: "Tên quyền",
        id: "name",
      },
      {
        cell: ({ row }) => {
          const { resource } = splitPermissionName(row.original.name)
          return (
            <Badge className={getResourceTypeBadgeClassName(resource)}>
              {getResourceLabel(resource)}
            </Badge>
          )
        },
        header: "Nhóm chức năng",
        id: "resource",
      },
      {
        cell: ({ row }) => getPermissionLabel(row.original),
        header: "Thao tác",
        id: "action",
      },
      {
        cell: ({ row }) =>
          row.original.accessLevel === null ? (
            <Badge variant="outline">Không giới hạn</Badge>
          ) : (
            <Badge variant="secondary">Cấp {row.original.accessLevel}</Badge>
          ),
        header: "Cấp độ",
        id: "accessLevel",
      },
      {
        cell: ({ row }) => row.original.createdBy || "System",
        header: "Người tạo",
        id: "createdBy",
      },
      {
        cell: ({ row }) => formatAuditDate(row.original.createdAt),
        header: "Ngày tạo",
        id: "createdAt",
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
          <PermissionActions
            canDeletePermissions={canDeletePermissions}
            canUpdatePermissions={canUpdatePermissions}
            onEditPermission={onEditPermission}
            onStatusRequest={onStatusRequest}
            permission={row.original}
          />
        ),
        header: "Hành động",
        id: "actions",
        meta: { className: "text-right", headerClassName: "text-right" },
      },
    ],
    [
      allSelectedOnPage,
      canDeletePermissions,
      canUpdatePermissions,
      firstRowNumber,
      onEditPermission,
      onStatusRequest,
      onToggleAllSelection,
      onToggleSelection,
      permissionIdsOnPage,
      selectedIds,
    ]
  )

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <ListToolbar
        isFiltered={isFiltered}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
        onSearchChange={onSearchChange}
        search={search}
        searchAriaLabel="Tìm quyền hạn"
        searchPlaceholder="Tìm tên hoặc nhóm quyền..."
      >
        <Select
          onValueChange={(value) =>
            onLevelChange(value as PermissionLevelFilter)
          }
          value={level}
        >
          <SelectTrigger
            aria-label="Lọc cấp độ quyền"
            className="w-full sm:w-45"
          >
            <SelectValue placeholder="Tất cả cấp độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả cấp độ</SelectItem>
            <SelectItem value="unrestricted">Không giới hạn</SelectItem>
            <SelectItem value="scoped">Có cấp độ</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => onStatusChange(value as StatusFilter)}
          value={status}
        >
          <SelectTrigger
            aria-label="Lọc trạng thái quyền"
            className="w-full sm:w-40"
          >
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
          </SelectContent>
        </Select>
      </ListToolbar>

      <BulkActionsBar
        isSubmitting={isBulkUpdating}
        onClear={onBulkClear}
        onDeactivate={onBulkDeactivate}
        onRecover={onBulkRecover}
        selectedCount={selectedIds.size}
      />

      {permissions.length ? (
        <>
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={permissions}
              getRowId={(permission) => permission.id}
            />
          </div>

          <div className="grid gap-3 p-3 md:hidden">
            {permissions.map((permission, index) => {
              const { resource } = splitPermissionName(permission.name)

              return (
                <article className="rounded-xl border p-4" key={permission.id}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      aria-label={`Chọn ${permission.name}`}
                      checked={selectedIds.has(permission.id)}
                      className="mt-1"
                      onCheckedChange={() => onToggleSelection(permission.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        #{firstRowNumber + index}
                      </p>
                      <p className="truncate font-semibold">
                        {permission.name}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-sm">
                        <Badge
                          className={getResourceTypeBadgeClassName(resource)}
                        >
                          {getResourceLabel(resource)}
                        </Badge>
                        <span>{getPermissionLabel(permission)}</span>
                      </div>
                    </div>
                    <PermissionActions
                      canDeletePermissions={canDeletePermissions}
                      canUpdatePermissions={canUpdatePermissions}
                      onEditPermission={onEditPermission}
                      onStatusRequest={onStatusRequest}
                      permission={permission}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <EntityStatusBadge isActive={permission.isActive} />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground">
                    <span>{permission.createdBy || "System"}</span>
                    <span>{formatAuditDate(permission.createdAt)}</span>
                    {permission.accessLevel === null ? (
                      <Badge variant="outline">Không giới hạn</Badge>
                    ) : (
                      <Badge variant="secondary">
                        Cấp {permission.accessLevel}
                      </Badge>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </>
      ) : (
        <SearchEmpty
          description="Thử thay đổi từ khóa hoặc bộ lọc đang chọn."
          title="Không tìm thấy quyền hạn phù hợp"
        />
      )}

      <Pagination
        className="rounded-none border-x-0 border-b-0 shadow-none"
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageSize={ACCESS_CONTROL_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  )
}
