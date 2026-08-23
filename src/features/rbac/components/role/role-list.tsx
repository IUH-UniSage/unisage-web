import type { ColumnDef } from "@tanstack/react-table"
import { Eye, MoreHorizontal, Pencil, Power, RotateCcw } from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RBAC_PAGE_SIZE } from "@/features/rbac/hooks/use-rbac-dashboard"
import type { StatusFilter } from "@/features/rbac/hooks/use-rbac-dashboard"
import type { AccessRole } from "@/features/rbac/schemas/rbac-schemas"
import { formatAuditDate } from "@/utils/date-format"

type RoleListProps = {
  canDeleteRoles: boolean
  canUpdateRoles: boolean
  currentPage: number
  isBulkUpdating: boolean
  onBulkClear: () => void
  onBulkDeactivate: () => void
  onBulkRecover: () => void
  onApplyFilters: () => void
  onDetail: (role: AccessRole) => void
  onEditRole: (role: AccessRole) => void
  onPageChange: (page: number) => void
  onPermissionChange: (value: string) => void
  onResetFilters: () => void
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  onStatusRequest: (role: AccessRole) => void
  onToggleAllSelection: (roleIds: string[]) => void
  onToggleSelection: (roleId: string) => void
  isFiltered: boolean
  permission: string
  permissionOptions: string[]
  roles: AccessRole[]
  search: string
  selectedIds: Set<string>
  status: StatusFilter
  totalItems: number
  totalPages: number
}

function RolePermissionBadges({ role }: { role: AccessRole }) {
  if (!role.permissions.length) {
    return <span className="text-xs text-muted-foreground">Chưa cấp quyền</span>
  }

  const visible = role.permissions.slice(0, 2)
  const rest = role.permissions.slice(2)

  return (
    <div className="flex max-w-72 flex-wrap gap-1.5">
      {visible.map((permission) => (
        <Badge
          className="max-w-44 truncate"
          key={permission.id}
          variant="outline"
        >
          {permission.name}
        </Badge>
      ))}
      {rest.length ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="cursor-default" variant="secondary">
              +{rest.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">
            <ul className="space-y-0.5">
              {rest.map((permission) => (
                <li key={permission.id}>{permission.name}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}

type RoleActionsProps = {
  canDeleteRoles: boolean
  canUpdateRoles: boolean
  onDetail: (role: AccessRole) => void
  onEditRole: (role: AccessRole) => void
  onStatusRequest: (role: AccessRole) => void
  role: AccessRole
}

function RoleActions({
  canDeleteRoles,
  canUpdateRoles,
  onDetail,
  onEditRole,
  onStatusRequest,
  role,
}: RoleActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Hành động cho ${role.name}`}
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onDetail(role)}>
          <Eye aria-hidden="true" />
          Xem chi tiết
        </DropdownMenuItem>
        {canUpdateRoles ? (
          <DropdownMenuItem onSelect={() => onEditRole(role)}>
            <Pencil aria-hidden="true" />
            Chỉnh sửa
          </DropdownMenuItem>
        ) : null}
        {canDeleteRoles ? (
          <DropdownMenuItem
            onSelect={() => onStatusRequest(role)}
            variant={role.isActive ? "destructive" : "default"}
          >
            {role.isActive ? (
              <Power aria-hidden="true" />
            ) : (
              <RotateCcw aria-hidden="true" />
            )}
            {role.isActive ? "Vô hiệu hóa" : "Khôi phục"}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function RoleList({
  canDeleteRoles,
  canUpdateRoles,
  currentPage,
  isBulkUpdating,
  isFiltered,
  onApplyFilters,
  onBulkClear,
  onBulkDeactivate,
  onBulkRecover,
  onDetail,
  onEditRole,
  onPageChange,
  onPermissionChange,
  onResetFilters,
  onSearchChange,
  onStatusChange,
  onStatusRequest,
  onToggleAllSelection,
  onToggleSelection,
  permission,
  permissionOptions,
  roles,
  search,
  selectedIds,
  status,
  totalItems,
  totalPages,
}: RoleListProps) {
  const roleIdsOnPage = roles.map((role) => role.id)
  const allSelectedOnPage =
    roleIdsOnPage.length > 0 && roleIdsOnPage.every((id) => selectedIds.has(id))
  const firstRowNumber = (currentPage - 1) * RBAC_PAGE_SIZE + 1

  const columns = useMemo<ColumnDef<AccessRole, unknown>[]>(
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
            aria-label="Chọn tất cả vai trò trong trang"
            checked={allSelectedOnPage}
            onCheckedChange={() => onToggleAllSelection(roleIdsOnPage)}
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
        cell: ({ row }) => (
          <>
            <p className="font-semibold">{row.original.name}</p>
            <p className="mt-0.5 max-w-52 truncate text-xs text-muted-foreground">
              {row.original.description || "Không có mô tả"}
            </p>
          </>
        ),
        header: "Tên vai trò",
        id: "name",
      },
      {
        cell: ({ row }) => <RolePermissionBadges role={row.original} />,
        header: "Quyền hạn tiêu biểu",
        id: "permissions",
      },
      {
        cell: ({ row }) => row.original.createdBy || "System",
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
          <RoleActions
            canDeleteRoles={canDeleteRoles}
            canUpdateRoles={canUpdateRoles}
            onDetail={onDetail}
            onEditRole={onEditRole}
            onStatusRequest={onStatusRequest}
            role={row.original}
          />
        ),
        header: "Hành động",
        id: "actions",
        meta: { className: "text-right", headerClassName: "text-right" },
      },
    ],
    [
      allSelectedOnPage,
      canDeleteRoles,
      canUpdateRoles,
      firstRowNumber,
      onDetail,
      onEditRole,
      onStatusRequest,
      onToggleAllSelection,
      onToggleSelection,
      roleIdsOnPage,
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
        searchAriaLabel="Tìm tên vai trò"
        searchPlaceholder="Tìm tên vai trò..."
      >
        <Select onValueChange={onPermissionChange} value={permission}>
          <SelectTrigger aria-label="Lọc theo quyền" className="w-full sm:w-45">
            <SelectValue placeholder="Tất cả quyền" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả quyền</SelectItem>
            {permissionOptions.map((permissionName) => (
              <SelectItem key={permissionName} value={permissionName}>
                {permissionName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => onStatusChange(value as StatusFilter)}
          value={status}
        >
          <SelectTrigger
            aria-label="Lọc trạng thái vai trò"
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

      {roles.length ? (
        <>
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={roles}
              getRowId={(role) => role.id}
            />
          </div>

          <div className="grid gap-3 p-3 md:hidden">
            {roles.map((role, index) => (
              <article className="rounded-xl border p-4" key={role.id}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    aria-label={`Chọn ${role.name}`}
                    checked={selectedIds.has(role.id)}
                    className="mt-1"
                    onCheckedChange={() => onToggleSelection(role.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      #{firstRowNumber + index}
                    </p>
                    <p className="truncate font-semibold">{role.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {role.description || "Không có mô tả"}
                    </p>
                  </div>
                  <RoleActions
                    canDeleteRoles={canDeleteRoles}
                    canUpdateRoles={canUpdateRoles}
                    onDetail={onDetail}
                    onEditRole={onEditRole}
                    onStatusRequest={onStatusRequest}
                    role={role}
                  />
                </div>
                <div className="mt-4">
                  <RolePermissionBadges role={role} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                  <div className="text-xs text-muted-foreground">
                    <p>{role.createdBy || "System"}</p>
                    <p className="mt-1">{formatAuditDate(role.createdAt)}</p>
                  </div>
                  <EntityStatusBadge isActive={role.isActive} />
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <SearchEmpty
          description="Thử thay đổi từ khóa hoặc bộ lọc đang chọn."
          title="Không tìm thấy vai trò phù hợp"
        />
      )}

      <Pagination
        className="rounded-none border-x-0 border-b-0 shadow-none"
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageSize={RBAC_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  )
}
