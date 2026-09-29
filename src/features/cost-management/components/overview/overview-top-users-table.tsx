import type { ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsageLogSummaryQuery } from "@/features/cost-management/queries/use-queries"
import type { UsageLogSummaryBucket } from "@/features/cost-management/schemas/cost-management-schemas"
import { formatUsd } from "@/features/cost-management/utils/format-cost"
import { getErrorMessage } from "@/utils/error-handler"

const TOP_N = 10
// Backend bucket for requests with neither a user nor a guest IP (ingestion jobs).
const UNATTRIBUTED_KEY = "unknown"

export function OverviewTopUsersTable({
  query,
}: {
  query: ReturnType<typeof useUsageLogSummaryQuery>
}) {
  // Backend already sorts the "user" groupBy bucket by priced cost DESC, so
  // taking the first 10 gives the top spenders without re-sorting here.
  const topBuckets = useMemo(
    () => (query.data?.buckets ?? []).slice(0, TOP_N),
    [query.data]
  )

  const columns = useMemo<ColumnDef<UsageLogSummaryBucket, unknown>[]>(
    () => [
      {
        cell: ({ row }) =>
          row.original.key === UNATTRIBUTED_KEY ? (
            <span className="text-muted-foreground">
              Hệ thống (ingest tài liệu, không gắn người dùng)
            </span>
          ) : (
            row.original.key
          ),
        header: "Người dùng / IP",
        id: "key",
      },
      {
        cell: ({ row }) => row.original.requestCount.toLocaleString("vi-VN"),
        header: "Số request",
        id: "requestCount",
        meta: { className: "text-right", headerClassName: "text-right w-32" },
      },
      {
        cell: ({ row }) => formatUsd(row.original.pricedCostUsd),
        header: "Chi phí",
        id: "pricedCostUsd",
        meta: { className: "text-right", headerClassName: "text-right w-32" },
      },
    ],
    []
  )

  return (
    <Card className="border bg-card shadow-none">
      <CardHeader>
        <CardTitle>Top 10 người dùng / IP theo chi phí</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {query.isPending ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : query.isError ? (
          <p className="p-5 text-sm text-destructive">
            {getErrorMessage(query.error)}
          </p>
        ) : topBuckets.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            Không có dữ liệu trong khoảng thời gian đã chọn
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={topBuckets}
            getRowId={(row) => row.key}
          />
        )}
      </CardContent>
    </Card>
  )
}
