import type { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useBudgetAlertsQuery } from "@/features/cost-management/queries/use-queries"
import {
  alertChannelSchema,
  alertStatusSchema,
  alertTypeSchema,
  type AlertChannel,
  type AlertStatus,
  type AlertType,
  type BudgetAlertLog,
} from "@/features/cost-management/schemas/cost-management-schemas"
import {
  getAlertChannelLabel,
  getAlertStatusBadgeClassName,
  getAlertStatusLabel,
  getAlertTypeLabel,
} from "@/features/cost-management/utils/alert-labels"
import { formatUsd } from "@/features/cost-management/utils/format-cost"
import { formatUtcDateTime } from "@/features/cost-management/utils/usage-display"
import { getErrorMessage } from "@/utils/error-handler"

const PAGE_SIZE = 10
const ALL = "ALL"

function AlertScopeCell({ alert }: { alert: BudgetAlertLog }) {
  if (alert.alertType === "SPIKE") {
    return <span className="text-sm">Toàn hệ thống</span>
  }
  return (
    <span className="text-sm">
      {alert.thresholdPercent != null
        ? `Ngưỡng ${alert.thresholdPercent}%`
        : "-"}
    </span>
  )
}

export function AlertHistoryTable() {
  const [page, setPage] = useState(1)
  const [alertType, setAlertType] = useState<AlertType>()
  const [channel, setChannel] = useState<AlertChannel>()
  const [status, setStatus] = useState<AlertStatus>()

  const alertsQuery = useBudgetAlertsQuery({
    alertType,
    channel,
    limit: PAGE_SIZE,
    page,
    status,
  })

  const alerts = alertsQuery.data?.data ?? []

  const columns: ColumnDef<BudgetAlertLog, unknown>[] = [
    {
      cell: ({ row }) => formatUtcDateTime(row.original.createdAt),
      header: "Thời điểm",
      id: "createdAt",
      meta: { className: "text-sm whitespace-nowrap" },
    },
    {
      cell: ({ row }) => getAlertTypeLabel(row.original.alertType),
      header: "Loại",
      id: "alertType",
      meta: { className: "text-sm" },
    },
    {
      cell: ({ row }) => <AlertScopeCell alert={row.original} />,
      header: "Ngưỡng",
      id: "threshold",
    },
    {
      cell: ({ row }) => (
        <span className="text-sm">
          {formatUsd(row.original.spentUsd)}
          {row.original.limitUsd != null
            ? ` / ${formatUsd(row.original.limitUsd)}`
            : ""}
        </span>
      ),
      header: "Chi phí / Giới hạn",
      id: "spentUsd",
    },
    {
      cell: ({ row }) => getAlertChannelLabel(row.original.channel),
      header: "Kênh",
      id: "channel",
      meta: { className: "text-sm" },
    },
    {
      cell: ({ row }) => (
        <Badge
          className={getAlertStatusBadgeClassName(row.original.status)}
          variant="ghost"
        >
          {getAlertStatusLabel(row.original.status)}
        </Badge>
      ),
      header: "Trạng thái",
      id: "status",
    },
    {
      cell: ({ row }) =>
        row.original.errorMessage ? (
          <span className="text-xs text-destructive">
            {row.original.errorMessage}
          </span>
        ) : (
          "-"
        ),
      header: "Lỗi",
      id: "error",
    },
  ]

  return (
    <Card className="border bg-card shadow-none">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>Lịch sử cảnh báo</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Select
            onValueChange={(value) => {
              setAlertType(value === ALL ? undefined : (value as AlertType))
              setPage(1)
            }}
            value={alertType ?? ALL}
          >
            <SelectTrigger aria-label="Lọc theo loại" className="w-36">
              <SelectValue placeholder="Mọi loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi loại</SelectItem>
              {alertTypeSchema.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {getAlertTypeLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              setChannel(value === ALL ? undefined : (value as AlertChannel))
              setPage(1)
            }}
            value={channel ?? ALL}
          >
            <SelectTrigger aria-label="Lọc theo kênh" className="w-36">
              <SelectValue placeholder="Mọi kênh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi kênh</SelectItem>
              {alertChannelSchema.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {getAlertChannelLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              setStatus(value === ALL ? undefined : (value as AlertStatus))
              setPage(1)
            }}
            value={status ?? ALL}
          >
            <SelectTrigger aria-label="Lọc theo trạng thái" className="w-40">
              <SelectValue placeholder="Mọi trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi trạng thái</SelectItem>
              {alertStatusSchema.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {getAlertStatusLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {alertsQuery.isPending ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : alertsQuery.isError ? (
          <p className="p-5 text-sm text-destructive">
            {getErrorMessage(alertsQuery.error)}
          </p>
        ) : alerts.length === 0 ? (
          <SearchEmpty
            description="Thử thay đổi bộ lọc."
            title="Không có cảnh báo nào"
          />
        ) : (
          <>
            <DataTable columns={columns} data={alerts} getRowId={(a) => a.id} />
            <Pagination
              className="rounded-none border-x-0 border-b-0 shadow-none"
              currentPage={page}
              onPageChange={setPage}
              pageSize={PAGE_SIZE}
              totalItems={alertsQuery.data?.totalItems ?? 0}
              totalPages={alertsQuery.data?.totalPages ?? 0}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
