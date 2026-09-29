import type { ColumnDef } from "@tanstack/react-table"
import { Eye } from "lucide-react"

import { DataTable } from "@/components/shared/list/data-table"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { UsageHistoryFiltersBar } from "@/features/cost-management/components/history/usage-history-filters"
import { UsageLogDrawer } from "@/features/cost-management/components/history/usage-log-drawer"
import { useUsageHistoryTab } from "@/features/cost-management/hooks/use-usage-history-tab"
import type { UsageLogListItem } from "@/features/cost-management/schemas/cost-management-schemas"
import { formatUsdPrecise } from "@/features/cost-management/utils/format-cost"
import { getUsagePurposeLabel } from "@/features/cost-management/utils/purpose-labels"
import {
  formatLatency,
  formatTokens,
  getUsageRequesterLabel,
  getUsageTotalCost,
} from "@/features/cost-management/utils/usage-display"
import {
  getUsageRequestStatusBadgeClassName,
  getUsageRequestStatusLabel,
} from "@/features/cost-management/utils/usage-labels"
import { formatDateTime } from "@/utils/date"
import { getErrorMessage } from "@/utils/error-handler"

function buildColumns(
  onView: (usageLogId: string) => void
): ColumnDef<UsageLogListItem, unknown>[] {
  return [
    {
      cell: ({ row }) => formatDateTime(row.original.startedAt),
      header: "Thời điểm",
      id: "startedAt",
      meta: { className: "text-sm whitespace-nowrap" },
    },
    {
      cell: ({ row }) => (
        <span className="block max-w-48 truncate text-sm">
          {getUsageRequesterLabel(row.original)}
        </span>
      ),
      header: "Người dùng / IP",
      id: "requester",
    },
    {
      cell: ({ row }) => getUsagePurposeLabel(row.original.purpose),
      header: "Mục đích",
      id: "purpose",
      meta: { className: "text-sm" },
    },
    {
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-sm">
            {row.original.models.length > 0
              ? row.original.models.join(", ")
              : "-"}
          </span>
          {row.original.hasFailover ? (
            <Badge
              className="border-transparent bg-warning/40 text-warning-foreground"
              variant="ghost"
            >
              failover
            </Badge>
          ) : null}
        </div>
      ),
      header: "Mô hình",
      id: "models",
    },
    {
      cell: ({ row }) =>
        `${formatTokens(row.original.totalInputTokens)} / ${formatTokens(row.original.totalOutputTokens)}`,
      header: "Token vào / ra",
      id: "tokens",
      meta: {
        className: "text-right text-sm whitespace-nowrap",
        headerClassName: "text-right",
      },
    },
    {
      cell: ({ row }) => {
        const cost = getUsageTotalCost(row.original)
        return (
          <span
            title={
              cost.approximate ? "Có phần chưa định giá (ước tính)" : undefined
            }
          >
            {cost.approximate ? "≈ " : ""}
            {formatUsdPrecise(cost.value)}
          </span>
        )
      },
      header: "Chi phí",
      id: "cost",
      meta: {
        className: "text-right text-sm whitespace-nowrap",
        headerClassName: "text-right",
      },
    },
    {
      cell: ({ row }) => formatLatency(row.original.latencyMs),
      header: "Độ trễ",
      id: "latency",
      meta: {
        className: "text-right text-sm whitespace-nowrap",
        headerClassName: "text-right",
      },
    },
    {
      cell: ({ row }) => (
        <Badge
          className={getUsageRequestStatusBadgeClassName(row.original.status)}
          variant="ghost"
        >
          {getUsageRequestStatusLabel(row.original.status)}
        </Badge>
      ),
      header: "Trạng thái",
      id: "status",
    },
    {
      cell: ({ row }) => (
        <Button
          aria-label="Xem chi tiết request"
          onClick={() => onView(row.original.id)}
          size="icon-sm"
          variant="ghost"
        >
          <Eye aria-hidden="true" />
        </Button>
      ),
      header: () => <span className="sr-only">Thao tác</span>,
      id: "actions",
      meta: { className: "w-12 text-right", headerClassName: "w-12" },
    },
  ]
}

export function UsageHistoryTab() {
  const history = useUsageHistoryTab()
  const { usageLogsQuery } = history
  const logs = usageLogsQuery.data?.data ?? []
  const columns = buildColumns(history.setSelectedUsageLogId)

  return (
    <div className="space-y-4">
      <h2 className="sr-only">Lịch sử sử dụng</h2>

      <UsageHistoryFiltersBar
        filters={history.filters}
        hasFilters={history.hasFilters}
        onChange={history.changeFilters}
        onClear={history.clearFilters}
      />

      <Card className="border bg-card shadow-none">
        <CardContent className="p-0">
          {usageLogsQuery.isPending ? (
            <div className="space-y-2 p-5">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : usageLogsQuery.isError ? (
            <p className="p-5 text-sm text-destructive">
              {getErrorMessage(usageLogsQuery.error)}
            </p>
          ) : logs.length === 0 ? (
            <SearchEmpty
              description="Thử thay đổi bộ lọc hoặc khoảng thời gian."
              title="Không có request nào"
            />
          ) : (
            <>
              <DataTable columns={columns} data={logs} getRowId={(l) => l.id} />
              <Pagination
                className="rounded-none border-x-0 border-b-0 shadow-none"
                currentPage={history.page}
                onPageChange={history.setPage}
                pageSize={history.pageSize}
                totalItems={usageLogsQuery.data?.totalItems ?? 0}
                totalPages={usageLogsQuery.data?.totalPages ?? 0}
              />
            </>
          )}
        </CardContent>
      </Card>

      <UsageLogDrawer
        onOpenChange={(open) => {
          if (!open) history.setSelectedUsageLogId(undefined)
        }}
        usageLogId={history.selectedUsageLogId}
      />
    </div>
  )
}
