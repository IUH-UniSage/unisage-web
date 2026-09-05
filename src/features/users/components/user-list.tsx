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
import {
  USER_PAGE_SIZE,
  type StatusFilter,
} from "@/features/users/hooks/use-user-dashboard"
import type { AppUser } from "@/features/users/schemas/user-schemas"
import { formatAuditDate } from "@/utils/date-format"

function userDisplayName(user: AppUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "—"
}

type UserActionsProps = {
  canDelete: boolean
  canUpdate: boolean
  onDetail: (user: AppUser) => void
  onEdit: (user: AppUser) => void
  onStatusRequest: (user: AppUser) => void
  user: AppUser
}

function UserActions({
  canDelete,
  canUpdate,
  onDetail,
  onEdit,
  onStatusRequest,
  user,
}: UserActionsProps) {
  const isActive = user.status === "ACTIVE"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Hành động cho ${userDisplayName(user)}`}
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onDetail(user)}>
          <Eye aria-hidden="true" />
          Xem chi tiết
        </DropdownMenuItem>
        {canUpdate ? (
          <DropdownMenuItem onSelect={() => onEdit(user)}>
            <Pencil aria-hidden="true" />
            Chỉnh sửa
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <DropdownMenuItem
            onSelect={() => onStatusRequest(user)}
            variant={isActive ? "destructive" : "default"}
          >
            {isActive ? (
              <Power aria-hidden="true" />
            ) : (
              <RotateCcw aria-hidden="true" />
            )}
            {isActive ? "Vô hiệu hóa" : "Khôi phục"}
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
  onApplyFilters: () => void
  onBulkClear: () => void
  onBulkDeactivate: () => void
  onBulkRecover: () => void
  onDetail: (user: AppUser) => void
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
  onApplyFilters,
  onBulkClear,
  onBulkDeactivate,
  onBulkRecover,
  onDetail,
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
            aria-label={`Chọn ${userDisplayName(row.original)}`}
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
          <p className="font-semibold">{userDisplayName(row.original)}</p>
        ),
        header: "Người dùng",
        id: "name",
      },
      {
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.code ?? "—"}
          </span>
        ),
        header: "Mã GV/SV",
        id: "code",
        meta: {
          className: "text-sm",
        },
      },
      {
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.email ?? "—"}
          </span>
        ),
        header: "Email",
        id: "email",
        meta: {
          className: "text-sm",
        },
      },
      {
        cell: ({ row }) => {
          const { departmentAccesses } = row.original
          if (!departmentAccesses?.length) {
            return <span className="text-xs text-muted-foreground">—</span>
          }
          return (
            <div className="flex max-w-48 flex-wrap gap-1">
              {departmentAccesses.slice(0, 2).map((da) => (
                <Badge
                  key={da.departmentId}
                  variant="outline"
                  className="max-w-36 truncate text-xs"
                >
                  {da.departmentName}
                </Badge>
              ))}
              {departmentAccesses.length > 2 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="cursor-default text-xs"
                    >
                      +{departmentAccesses.length - 2}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {departmentAccesses
                      .slice(2)
                      .map((da) => da.departmentName)
                      .join(", ")}
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          )
        },
        header: "Phòng ban",
        id: "department",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) =>
          row.original.roleName ? (
            <Badge variant="outline">{row.original.roleName}</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Chưa gán</span>
          ),
        header: "Vai trò",
        id: "role",
      },
      {
        cell: ({ row }) => formatAuditDate(row.original.createdAt),
        header: "Ngày tạo",
        id: "createdAt",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => (
          <EntityStatusBadge isActive={row.original.status === "ACTIVE"} />
        ),
        header: "Trạng thái",
        id: "status",
      },
      {
        cell: ({ row }) => (
          <UserActions
            canDelete={canDelete}
            canUpdate={canUpdate}
            onDetail={onDetail}
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
      onDetail,
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
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
        onSearchChange={onSearchChange}
        search={search}
        searchAriaLabel="Tìm người dùng"
        searchPlaceholder="Tìm tên, email hoặc mã GV/SV..."
      >
        <Select
          onValueChange={(value) => onStatusChange(value as StatusFilter)}
          value={status}
        >
          <SelectTrigger
            aria-label="Lọc trạng thái người dùng"
            className="w-full sm:w-44"
          >
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Vô hiệu hóa</SelectItem>
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
                    aria-label={`Chọn ${userDisplayName(user)}`}
                    checked={selectedIds.has(user.id)}
                    className="mt-1"
                    onCheckedChange={() => onToggleSelection(user.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      #{firstRowNumber + index}
                    </p>
                    <p className="truncate font-semibold">
                      {userDisplayName(user)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {user.email ?? "—"}
                    </p>
                    {user.roleName ? (
                      <Badge className="mt-1 text-xs" variant="outline">
                        {user.roleName}
                      </Badge>
                    ) : null}
                  </div>
                  <UserActions
                    canDelete={canDelete}
                    canUpdate={canUpdate}
                    onDetail={onDetail}
                    onEdit={onEdit}
                    onStatusRequest={onStatusRequest}
                    user={user}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    {formatAuditDate(user.createdAt)}
                  </p>
                  <EntityStatusBadge isActive={user.status === "ACTIVE"} />
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
