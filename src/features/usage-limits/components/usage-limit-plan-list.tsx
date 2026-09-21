import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useMemo } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { ListToolbar } from "@/components/shared/list/list-toolbar"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import type { UsageLimitPlan } from "@/features/usage-limits/schemas/usage-limit-schemas"
import {
  getPlanKind,
  getPlanKindBadgeClassName,
  PLAN_KIND_LABELS,
  type PlanKindFilter,
} from "@/features/usage-limits/utils/plan-kind"
import { formatTokenLimit } from "@/features/usage-limits/utils/usage-format"
import { cn } from "@/lib/utils"
import { formatAuditDate } from "@/utils/date-format"

export const USAGE_LIMIT_PLAN_PAGE_SIZE = 10

type PlanActionsProps = {
  canDelete: boolean
  canUpdate: boolean
  onEdit: (plan: UsageLimitPlan) => void
  onRequestDelete: (plan: UsageLimitPlan) => void
  plan: UsageLimitPlan
}

function PlanActions({
  canDelete,
  canUpdate,
  onEdit,
  onRequestDelete,
  plan,
}: PlanActionsProps) {
  // The default plan can be edited but never removed.
  const canDeleteThisPlan = canDelete && !plan.isDefault
  if (!canUpdate && !canDeleteThisPlan) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Hành động cho gói ${plan.name}`}
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canUpdate ? (
          <DropdownMenuItem onSelect={() => onEdit(plan)}>
            <Pencil aria-hidden="true" />
            Chỉnh sửa
          </DropdownMenuItem>
        ) : null}
        {canDeleteThisPlan ? (
          <DropdownMenuItem
            onSelect={() => onRequestDelete(plan)}
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

function KindBadge({ plan }: { plan: UsageLimitPlan }) {
  const kind = getPlanKind(plan)

  return (
    <Badge
      className={cn("gap-1.5 px-2.5", getPlanKindBadgeClassName(kind))}
      variant="ghost"
    >
      {PLAN_KIND_LABELS[kind]}
    </Badge>
  )
}

type UsageLimitPlanListProps = {
  canDelete: boolean
  canUpdate: boolean
  currentPage: number
  isFiltered: boolean
  kind: PlanKindFilter
  onApplyFilters: () => void
  onEdit: (plan: UsageLimitPlan) => void
  onKindChange: (value: PlanKindFilter) => void
  onPageChange: (page: number) => void
  onRequestDelete: (plan: UsageLimitPlan) => void
  onResetFilters: () => void
  onSearchChange: (value: string) => void
  plans: UsageLimitPlan[]
  search: string
  totalItems: number
  totalPages: number
}

export function UsageLimitPlanList({
  canDelete,
  canUpdate,
  currentPage,
  isFiltered,
  kind,
  onApplyFilters,
  onEdit,
  onKindChange,
  onPageChange,
  onRequestDelete,
  onResetFilters,
  onSearchChange,
  plans,
  search,
  totalItems,
  totalPages,
}: UsageLimitPlanListProps) {
  const firstRowNumber = (currentPage - 1) * USAGE_LIMIT_PLAN_PAGE_SIZE + 1

  const columns = useMemo<ColumnDef<UsageLimitPlan, unknown>[]>(
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
        cell: ({ row }) => <p className="font-semibold">{row.original.name}</p>,
        header: "Tên gói",
        id: "name",
      },
      {
        cell: ({ row }) => formatTokenLimit(row.original.dailyTokenLimit),
        header: "Token / 24 giờ",
        id: "daily",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => formatTokenLimit(row.original.weeklyTokenLimit),
        header: "Token / 7 ngày",
        id: "weekly",
        meta: { className: "text-sm" },
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
        cell: ({ row }) => <KindBadge plan={row.original} />,
        header: "Loại gói",
        id: "kind",
      },
      {
        cell: ({ row }) => (
          <PlanActions
            canDelete={canDelete}
            canUpdate={canUpdate}
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
            plan={row.original}
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
      <ListToolbar
        isFiltered={isFiltered}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
        onSearchChange={onSearchChange}
        search={search}
        searchAriaLabel="Tìm gói hạn mức"
        searchPlaceholder="Tìm theo tên gói..."
      >
        <Select
          onValueChange={(value) => onKindChange(value as PlanKindFilter)}
          value={kind}
        >
          <SelectTrigger
            aria-label="Lọc theo loại gói"
            className="w-full sm:w-44"
          >
            <SelectValue placeholder="Tất cả loại gói" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại gói</SelectItem>
            <SelectItem value="default">{PLAN_KIND_LABELS.default}</SelectItem>
            <SelectItem value="limited">{PLAN_KIND_LABELS.limited}</SelectItem>
            <SelectItem value="unlimited">
              {PLAN_KIND_LABELS.unlimited}
            </SelectItem>
          </SelectContent>
        </Select>
      </ListToolbar>

      {plans.length ? (
        <div className="hidden md:block">
          <DataTable
            columns={columns}
            data={plans}
            getRowId={(plan) => plan.id}
          />
        </div>
      ) : null}

      {plans.length ? (
        <div className="grid gap-3 p-3 md:hidden">
          {plans.map((plan, index) => (
            <article className="rounded-xl border p-4" key={plan.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    #{firstRowNumber + index}
                  </p>
                  <p className="font-semibold">{plan.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatTokenLimit(plan.dailyTokenLimit)} / 24 giờ ·{" "}
                    {formatTokenLimit(plan.weeklyTokenLimit)} / 7 ngày
                  </p>
                </div>
                <PlanActions
                  canDelete={canDelete}
                  canUpdate={canUpdate}
                  onEdit={onEdit}
                  onRequestDelete={onRequestDelete}
                  plan={plan}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                <div className="text-xs text-muted-foreground">
                  <p>{plan.createdByName || "System"}</p>
                  <p className="mt-1">{formatAuditDate(plan.createdAt)}</p>
                </div>
                <KindBadge plan={plan} />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!plans.length ? (
        <SearchEmpty
          description="Thử thay đổi từ khóa hoặc bộ lọc."
          title="Không tìm thấy gói hạn mức phù hợp"
        />
      ) : null}

      <Pagination
        className="rounded-none border-x-0 border-b-0 shadow-none"
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageSize={USAGE_LIMIT_PLAN_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  )
}
