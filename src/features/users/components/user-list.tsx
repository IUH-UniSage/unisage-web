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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  USER_PAGE_SIZE,
  type StatusFilter,
} from "@/features/users/hooks/use-user-dashboard"
import type { AppUser } from "@/features/users/schemas/user-schemas"
import { formatAuditDate } from "@/utils/date-format"

type UserRoleBadgesProps = { user: AppUser }

function UserRoleBadges({ user }: UserRoleBadgesProps) {
  if (!user.roles.length) {
    return (
      <span className="text-xs text-muted-foreground">Chưa gán vai trò</span>
    )
  }

  const visible = user.roles.slice(0, 2)
  const rest = user.roles.slice(2)

  return (
    <div className="flex max-w-60 flex-wrap gap-1.5">
      {visible.map((role) => (
        <Badge className="max-w-36 truncate" key={role.id} variant="outline">
          {role.name}
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
              {rest.map((role) => (
                <li key={role.id}>{role.name}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}

type UserActionsProps = {
  canDelete: boolean
  canUpdate: boolean
  onEdit: (user: AppUser) => void
  onStatusRequest: (user: AppUser) => void
  user: AppUser
}

function UserActions({
  canDelete,
  canUpdate,
  onEdit,
  onStatusRequest,
  user,
}: UserActionsProps) {
  if (!canUpdate && !canDelete) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Hành động cho ${user.fullName}`}
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canUpdate ? (
          <DropdownMenuItem onSelect={() => onEdit(user)}>
            <Pencil aria-hidden="true" />
            Chỉnh sửa
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <DropdownMenuItem
            onSelect={() => onStatusRequest(user)}
            variant={user.isActive ? "destructive" : "default"}
          >
            {user.isActive ? (
              <Power aria-hidden="true" />
            ) : (
              <RotateCcw aria-hidden="true" />
            )}
            {user.isActive ? "Vô hiệu hóa" : "Khôi phục"}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type UserListProps = {
  canDelete: boolean
  canUpdate: boolean
  currentPage: number
  isBulkUpdating: boolean
  isFiltered: boolean
  onBulkClear: () => void
  onBulkDeactivate: () => void
  onBulkRecover: () => void
  onEdit: (user: AppUser) => void
  onPageChange: (page: number) => void
  onResetFilters: () => void
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  onStatusRequest: (user: AppUser) => void
  onToggleAllSelection: (userIds: string[]) => void
  onToggleSelection: (userId: string) => void
  search: string
  selectedIds: Set<string>
  status: StatusFilter
  totalItems: number
  totalPages: number
  users: AppUser[]
}

export function UserList({
  canDelete,
  canUpdate,
  currentPage,
  isBulkUpdating,
  isFiltered,
  onBulkClear,
  onBulkDeactivate,
  onBulkRecover,
  onEdit,
  onPageChange,
  onResetFilters,
  onSearchChange,
  onStatusChange,
  onStatusRequest,
  onToggleAllSelection,
  onToggleSelection,
  search,
  selectedIds,
  status,
  totalItems,
  totalPages,
  users,
}: UserListProps) {
  const userIdsOnPage = users.map((user) => user.id)
  const allSelectedOnPage =
    userIdsOnPage.length > 0 && userIdsOnPage.every((id) => selectedIds.has(id))
  const firstRowNumber = (currentPage - 1) * USER_PAGE_SIZE + 1

  const columns = useMemo<ColumnDef<AppUser, unknown>[]>(
    () => [
      {
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Chọn ${row.original.fullName}`}
            checked={selectedIds.has(row.original.id)}
            onCheckedChange={() => onToggleSelection(row.original.id)}
          />
        ),
        header: () => (
          <Checkbox
            aria-label="Chọn tất cả người dùng trong trang"
            checked={allSelectedOnPage}
            onCheckedChange={() => onToggleAllSelection(userIdsOnPage)}
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
            <p className="font-semibold">{row.original.fullName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              @{row.original.username} · {row.original.email}
            </p>
          </>
        ),
        header: "Người dùng",
        id: "name",
      },
      {
        cell: ({ row }) =>
          row.original.department?.name ?? (
            <span className="text-xs text-muted-foreground">—</span>
          ),
        header: "Phòng ban",
        id: "department",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => <UserRoleBadges user={row.original} />,
        header: "Vai trò",
        id: "roles",
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
          <UserActions
            canDelete={canDelete}
            canUpdate={canUpdate}
            onEdit={onEdit}
            onStatusRequest={onStatusRequest}
            user={row.original}
          />
        ),
        header: "Hành động",
        id: "actions",
        meta: { className: "text-right", headerClassName: "text-right" },
      },
    ],
    [
      allSelectedOnPage,
      canDelete,
      canUpdate,
      firstRowNumber,
      onEdit,
      onStatusRequest,
      onToggleAllSelection,
      onToggleSelection,
      selectedIds,
      userIdsOnPage,
    ]
  )

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <ListToolbar
        isFiltered={isFiltered}
        onApplyFilters={() => undefined}
        onResetFilters={onResetFilters}
        onSearchChange={onSearchChange}
        search={search}
        searchAriaLabel="Tìm người dùng"
        searchPlaceholder="Tìm tên, username hoặc email..."
      >
        <Select
          onValueChange={(value) => onStatusChange(value as StatusFilter)}
          value={status}
        >
          <SelectTrigger
            aria-label="Lọc trạng thái người dùng"
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

      {users.length ? (
        <>
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={users}
              getRowId={(user) => user.id}
            />
          </div>

          <div className="grid gap-3 p-3 md:hidden">
            {users.map((user, index) => (
              <article className="rounded-xl border p-4" key={user.id}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    aria-label={`Chọn ${user.fullName}`}
                    checked={selectedIds.has(user.id)}
                    className="mt-1"
                    onCheckedChange={() => onToggleSelection(user.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      #{firstRowNumber + index}
                    </p>
                    <p className="truncate font-semibold">{user.fullName}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      @{user.username} · {user.email}
                    </p>
                    {user.department ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {user.department.name}
                      </p>
                    ) : null}
                  </div>
                  <UserActions
                    canDelete={canDelete}
                    canUpdate={canUpdate}
                    onEdit={onEdit}
                    onStatusRequest={onStatusRequest}
                    user={user}
                  />
                </div>
                <div className="mt-3">
                  <UserRoleBadges user={user} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                  <div className="text-xs text-muted-foreground">
                    <p>{user.createdBy || "System"}</p>
                    <p className="mt-1">{formatAuditDate(user.createdAt)}</p>
                  </div>
                  <EntityStatusBadge isActive={user.isActive} />
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <SearchEmpty
          description="Thử thay đổi từ khóa hoặc bộ lọc đang chọn."
          title="Không tìm thấy người dùng phù hợp"
        />
      )}

      <Pagination
        className="rounded-none border-x-0 border-b-0 shadow-none"
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageSize={USER_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  )
}
