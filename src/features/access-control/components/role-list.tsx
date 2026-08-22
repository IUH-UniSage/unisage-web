import { Pencil, Power, RotateCcw, Search, ShieldCheck } from "lucide-react"

import { Pagination } from "@/components/shared/pagination"
import { SearchEmpty } from "@/components/shared/search-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AccessStatusBadge } from "@/features/access-control/components/access-status-badge"
import { BulkActionsBar } from "@/features/access-control/components/bulk-actions-bar"
import { ACCESS_CONTROL_PAGE_SIZE } from "@/features/access-control/hooks/use-access-control-dashboard"
import type { StatusFilter } from "@/features/access-control/hooks/use-access-control-dashboard"
import { formatAuditDate } from "@/features/access-control/utils/access-control-formatters"
import type { AccessRole } from "@/features/access-control/schemas/access-control-schemas"

type RoleListProps = {
  canDeleteRoles: boolean
  canUpdateRoles: boolean
  currentPage: number
  isBulkUpdating: boolean
  onBulkClear: () => void
  onBulkDeactivate: () => void
  onBulkRecover: () => void
  onEditRole: (role: AccessRole) => void
  onPageChange: (page: number) => void
  onPermissionChange: (value: string) => void
  onResetFilters: () => void
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  onStatusRequest: (role: AccessRole) => void
  onToggleAllSelection: (roleIds: string[]) => void
  onToggleSelection: (roleId: string) => void
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

  return (
    <div className="flex max-w-72 flex-wrap gap-1.5">
      {role.permissions.slice(0, 2).map((permission) => (
        <Badge
          className="max-w-44 truncate"
          key={permission.id}
          variant="outline"
        >
          {permission.name}
        </Badge>
      ))}
      {role.permissions.length > 2 ? (
        <Badge variant="secondary">+{role.permissions.length - 2}</Badge>
      ) : null}
    </div>
  )
}

type RoleActionsProps = {
  canDeleteRoles: boolean
  canUpdateRoles: boolean
  onEditRole: (role: AccessRole) => void
  onStatusRequest: (role: AccessRole) => void
  role: AccessRole
}

function RoleActions({
  canDeleteRoles,
  canUpdateRoles,
  onEditRole,
  onStatusRequest,
  role,
}: RoleActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {canUpdateRoles ? (
        <Button
          aria-label={`Chỉnh sửa ${role.name}`}
          onClick={() => onEditRole(role)}
          size="icon-sm"
          variant="ghost"
        >
          <Pencil aria-hidden="true" />
        </Button>
      ) : null}
      {canDeleteRoles ? (
        <Button
          aria-label={
            role.isActive
              ? `Vô hiệu hóa ${role.name}`
              : `Khôi phục ${role.name}`
          }
          onClick={() => onStatusRequest(role)}
          size="icon-sm"
          variant="ghost"
        >
          {role.isActive ? (
            <Power aria-hidden="true" />
          ) : (
            <RotateCcw aria-hidden="true" />
          )}
        </Button>
      ) : null}
    </div>
  )
}

export function RoleList({
  canDeleteRoles,
  canUpdateRoles,
  currentPage,
  isBulkUpdating,
  onBulkClear,
  onBulkDeactivate,
  onBulkRecover,
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
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="grid gap-3 border-b p-3 md:grid-cols-[minmax(220px,1fr)_180px_170px_auto] md:p-4">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Tìm tên vai trò"
            className="pl-9"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm tên vai trò..."
            value={search}
          />
        </div>
        <Select onValueChange={onPermissionChange} value={permission}>
          <SelectTrigger aria-label="Lọc theo quyền" className="w-full">
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
          <SelectTrigger aria-label="Lọc trạng thái vai trò" className="w-full">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onResetFilters} variant="ghost">
          Đặt lại
        </Button>
      </div>

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Chọn tất cả vai trò trong trang"
                      checked={allSelectedOnPage}
                      onCheckedChange={() =>
                        onToggleAllSelection(roleIdsOnPage)
                      }
                    />
                  </TableHead>
                  <TableHead>Tên vai trò</TableHead>
                  <TableHead>Quyền hạn tiêu biểu</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Checkbox
                        aria-label={`Chọn ${role.name}`}
                        checked={selectedIds.has(role.id)}
                        onCheckedChange={() => onToggleSelection(role.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
                          <ShieldCheck aria-hidden="true" className="size-4" />
                        </span>
                        <div>
                          <p className="font-semibold">{role.name}</p>
                          <p className="mt-0.5 max-w-52 truncate text-xs text-muted-foreground">
                            {role.description || "Không có mô tả"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RolePermissionBadges role={role} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {role.createdBy || "System"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatAuditDate(role.createdAt)}
                    </TableCell>
                    <TableCell>
                      <AccessStatusBadge isActive={role.isActive} />
                    </TableCell>
                    <TableCell>
                      <RoleActions
                        canDeleteRoles={canDeleteRoles}
                        canUpdateRoles={canUpdateRoles}
                        onEditRole={onEditRole}
                        onStatusRequest={onStatusRequest}
                        role={role}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 p-3 md:hidden">
            {roles.map((role) => (
              <article className="rounded-xl border p-4" key={role.id}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    aria-label={`Chọn ${role.name}`}
                    checked={selectedIds.has(role.id)}
                    className="mt-2"
                    onCheckedChange={() => onToggleSelection(role.id)}
                  />
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <ShieldCheck aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{role.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {role.description || "Không có mô tả"}
                    </p>
                  </div>
                  <RoleActions
                    canDeleteRoles={canDeleteRoles}
                    canUpdateRoles={canUpdateRoles}
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
                  <AccessStatusBadge isActive={role.isActive} />
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
        pageSize={ACCESS_CONTROL_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  )
}
