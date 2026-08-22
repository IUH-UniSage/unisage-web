import { KeyRound, Pencil, Power, RotateCcw, Search } from "lucide-react"

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
  return (
    <div className="flex items-center justify-end gap-1">
      {canUpdatePermissions ? (
        <Button
          aria-label={`Chỉnh sửa ${permission.name}`}
          onClick={() => onEditPermission(permission)}
          size="icon-sm"
          variant="ghost"
        >
          <Pencil aria-hidden="true" />
        </Button>
      ) : null}
      {canDeletePermissions ? (
        <Button
          aria-label={
            permission.isActive
              ? `Vô hiệu hóa ${permission.name}`
              : `Khôi phục ${permission.name}`
          }
          onClick={() => onStatusRequest(permission)}
          size="icon-sm"
          variant="ghost"
        >
          {permission.isActive ? (
            <Power aria-hidden="true" />
          ) : (
            <RotateCcw aria-hidden="true" />
          )}
        </Button>
      ) : null}
    </div>
  )
}

type PermissionListProps = {
  canDeletePermissions: boolean
  canUpdatePermissions: boolean
  currentPage: number
  isBulkUpdating: boolean
  level: PermissionLevelFilter
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
  level,
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
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="grid gap-3 border-b p-3 md:grid-cols-[minmax(220px,1fr)_180px_170px_auto] md:p-4">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Tìm quyền hạn"
            className="pl-9"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm tên hoặc nhóm quyền..."
            value={search}
          />
        </div>
        <Select
          onValueChange={(value) =>
            onLevelChange(value as PermissionLevelFilter)
          }
          value={level}
        >
          <SelectTrigger aria-label="Lọc cấp độ quyền" className="w-full">
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
          <SelectTrigger aria-label="Lọc trạng thái quyền" className="w-full">
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

      {permissions.length ? (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Chọn tất cả quyền hạn trong trang"
                      checked={allSelectedOnPage}
                      onCheckedChange={() =>
                        onToggleAllSelection(permissionIdsOnPage)
                      }
                    />
                  </TableHead>
                  <TableHead>Tên quyền</TableHead>
                  <TableHead>Nhóm chức năng</TableHead>
                  <TableHead>Thao tác</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => {
                  const { resource } = splitPermissionName(permission.name)

                  return (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <Checkbox
                          aria-label={`Chọn ${permission.name}`}
                          checked={selectedIds.has(permission.id)}
                          onCheckedChange={() =>
                            onToggleSelection(permission.id)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
                            <KeyRound aria-hidden="true" className="size-4" />
                          </span>
                          <span className="font-mono text-xs font-semibold">
                            {permission.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getResourceLabel(resource)}</TableCell>
                      <TableCell>{getPermissionLabel(permission)}</TableCell>
                      <TableCell>
                        {permission.accessLevel === null ? (
                          <Badge variant="outline">Không giới hạn</Badge>
                        ) : (
                          <Badge variant="secondary">
                            Cấp {permission.accessLevel}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{permission.createdBy || "System"}</TableCell>
                      <TableCell>
                        {formatAuditDate(permission.createdAt)}
                      </TableCell>
                      <TableCell>
                        <AccessStatusBadge isActive={permission.isActive} />
                      </TableCell>
                      <TableCell>
                        <PermissionActions
                          canDeletePermissions={canDeletePermissions}
                          canUpdatePermissions={canUpdatePermissions}
                          onEditPermission={onEditPermission}
                          onStatusRequest={onStatusRequest}
                          permission={permission}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 p-3 md:hidden">
            {permissions.map((permission) => {
              const { resource } = splitPermissionName(permission.name)

              return (
                <article className="rounded-xl border p-4" key={permission.id}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      aria-label={`Chọn ${permission.name}`}
                      checked={selectedIds.has(permission.id)}
                      className="mt-2"
                      onCheckedChange={() => onToggleSelection(permission.id)}
                    />
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                      <KeyRound aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs font-semibold">
                        {permission.name}
                      </p>
                      <p className="mt-1 text-sm">
                        {getResourceLabel(resource)} ·{" "}
                        {getPermissionLabel(permission)}
                      </p>
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
                    <AccessStatusBadge isActive={permission.isActive} />
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
