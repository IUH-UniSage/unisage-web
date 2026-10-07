import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useMemo } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import type { Budget } from "@/features/cost-management/schemas/cost-management-schemas"
import {
  getBudgetActionLabel,
  getBudgetPeriodLabel,
  getBudgetScopeLabel,
} from "@/features/cost-management/utils/budget-labels"
import {
  formatPercent,
  formatUsd,
} from "@/features/cost-management/utils/format-cost"
import { getUsagePurposeLabel } from "@/features/cost-management/utils/purpose-labels"
import { cn } from "@/lib/utils"

function spentPercentColorClassName(percent: number | null): string {
  if (percent == null) return ""
  if (percent > 80) return "text-destructive"
  if (percent >= 50) return "text-warning"
  return "text-success"
}

function BudgetScopeCell({ budget }: { budget: Budget }) {
  const detail =
    budget.scope === "PROVIDER" && budget.scopeProvider
      ? budget.scopeProvider
      : budget.scope === "PURPOSE" && budget.scopePurpose
        ? getUsagePurposeLabel(budget.scopePurpose)
        : null

  return (
    <div>
      <p className="font-semibold">{getBudgetScopeLabel(budget.scope)}</p>
      {detail ? (
        <p className="text-xs text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  )
}

type BudgetActionsProps = {
  budget: Budget
  canDelete: boolean
  canUpdate: boolean
  onEdit: (budget: Budget) => void
  onRequestDelete: (budget: Budget) => void
}

function BudgetActions({
  budget,
  canDelete,
  canUpdate,
  onEdit,
  onRequestDelete,
}: BudgetActionsProps) {
  if (!canUpdate && !canDelete) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Hành động cho ngân sách ${getBudgetScopeLabel(budget.scope)}`}
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canUpdate ? (
          <DropdownMenuItem onSelect={() => onEdit(budget)}>
            <Pencil aria-hidden="true" />
            Chỉnh sửa
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <DropdownMenuItem
            onSelect={() => onRequestDelete(budget)}
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

type BudgetListProps = {
  budgets: Budget[]
  canDelete: boolean
  canUpdate: boolean
  onEdit: (budget: Budget) => void
  onRequestDelete: (budget: Budget) => void
}

export function BudgetList({
  budgets,
  canDelete,
  canUpdate,
  onEdit,
  onRequestDelete,
}: BudgetListProps) {
  const columns = useMemo<ColumnDef<Budget, unknown>[]>(
    () => [
      {
        cell: ({ row }) => <BudgetScopeCell budget={row.original} />,
        header: "Phạm vi",
        id: "scope",
      },
      {
        cell: ({ row }) => getBudgetPeriodLabel(row.original.period),
        header: "Chu kỳ",
        id: "period",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => formatUsd(row.original.limitUsd),
        header: "Giới hạn",
        id: "limitUsd",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) =>
          row.original.spentUsd != null
            ? formatUsd(row.original.spentUsd)
            : "-",
        header: "Đã dùng",
        id: "spentUsd",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) =>
          row.original.spentPercent != null ? (
            <span
              className={cn(
                "font-medium",
                spentPercentColorClassName(row.original.spentPercent)
              )}
            >
              {formatPercent(row.original.spentPercent)}
            </span>
          ) : (
            "-"
          ),
        header: "%",
        id: "spentPercent",
      },
      {
        cell: ({ row }) => (
          <div>
            <p className="text-sm">
              {getBudgetActionLabel(row.original.action)}
            </p>
            {row.original.action === "THROTTLE" &&
            row.original.throttleMaxConcurrency != null ? (
              <p className="text-xs text-muted-foreground">
                Tối đa {row.original.throttleMaxConcurrency} đồng thời
              </p>
            ) : null}
          </div>
        ),
        header: "Hành động khi vượt",
        id: "action",
      },
      {
        cell: ({ row }) => (
          <Badge variant={row.original.isEnabled ? "secondary" : "outline"}>
            {row.original.isEnabled ? "Đang bật" : "Đã tắt"}
          </Badge>
        ),
        header: "Trạng thái",
        id: "isEnabled",
      },
      {
        cell: ({ row }) => (
          <BudgetActions
            budget={row.original}
            canDelete={canDelete}
            canUpdate={canUpdate}
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
          />
        ),
        header: "Hành động",
        id: "actions",
        meta: { className: "text-right", headerClassName: "text-right" },
      },
    ],
    [canDelete, canUpdate, onEdit, onRequestDelete]
  )

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      {budgets.length ? (
        <div className="hidden md:block">
          <DataTable
            columns={columns}
            data={budgets}
            getRowId={(budget) => budget.id}
          />
        </div>
      ) : null}

      {budgets.length ? (
        <div
          {...tourAnchor(TOUR_ANCHORS.mobileList)}
          className="grid gap-3 p-3 md:hidden"
        >
          {budgets.map((budget) => (
            <article className="rounded-xl border p-4" key={budget.id}>
              <div className="flex items-start justify-between gap-3">
                <BudgetScopeCell budget={budget} />
                <BudgetActions
                  budget={budget}
                  canDelete={canDelete}
                  canUpdate={canUpdate}
                  onEdit={onEdit}
                  onRequestDelete={onRequestDelete}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>{getBudgetPeriodLabel(budget.period)}</p>
                <p>{getBudgetActionLabel(budget.action)}</p>
                <p>Giới hạn: {formatUsd(budget.limitUsd)}</p>
                <p>
                  Đã dùng:{" "}
                  {budget.spentUsd != null ? formatUsd(budget.spentUsd) : "-"}
                  {budget.spentPercent != null
                    ? ` (${formatPercent(budget.spentPercent)})`
                    : ""}
                </p>
              </div>
              <div className="mt-3 border-t pt-3">
                <Badge variant={budget.isEnabled ? "secondary" : "outline"}>
                  {budget.isEnabled ? "Đang bật" : "Đã tắt"}
                </Badge>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!budgets.length ? (
        <SearchEmpty
          description="Thêm ngân sách hệ thống, theo nhà cung cấp hoặc theo mục đích để bắt đầu theo dõi."
          title="Chưa có ngân sách nào"
        />
      ) : null}
    </div>
  )
}
