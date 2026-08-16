import { KeyRound, Search } from "lucide-react"

import { Pagination } from "@/components/shared/pagination"
import { SearchEmpty } from "@/components/shared/search-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
} from "@/features/access-control/lib/access-control-formatters"
import type { AccessPermission } from "@/features/access-control/schemas/access-control-schemas"

type PermissionListProps = {
  currentPage: number
  level: PermissionLevelFilter
  onLevelChange: (value: PermissionLevelFilter) => void
  onPageChange: (page: number) => void
  onResetFilters: () => void
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  permissions: AccessPermission[]
  search: string
  status: StatusFilter
  totalItems: number
  totalPages: number
}

export function PermissionList({
  currentPage,
  level,
  onLevelChange,
  onPageChange,
  onResetFilters,
  onSearchChange,
  onStatusChange,
  permissions,
  search,
  status,
  totalItems,
  totalPages,
}: PermissionListProps) {
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

      {permissions.length ? (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên quyền</TableHead>
                  <TableHead>Nhóm chức năng</TableHead>
                  <TableHead>Thao tác</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => {
                  const { resource } = splitPermissionName(permission.name)

                  return (
                    <TableRow key={permission.id}>
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
