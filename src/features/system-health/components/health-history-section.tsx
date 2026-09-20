import type { ColumnDef } from "@tanstack/react-table"
import { useMemo, useState } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Skeleton } from "@/components/ui/skeleton"
import { HealthStatusBadge } from "@/features/system-health/components/health-status-badge"
import { useSystemHealthHistoryQuery } from "@/features/system-health/queries/use-queries"
import {
  getComponentLabel,
  type HealthCheckResponse,
} from "@/features/system-health/schemas/system-health-schemas"
import { getErrorMessage } from "@/utils/error-handler"
import { formatDateTime } from "@/utils/date"

const PAGE_SIZE = 10

// Only the non-UP components matter for a historical row - dumping all 4
// columns (db/gateway/agent/minio) for every row is noisy when the common
// case is "everything was fine"; this collapses to "—" for a fully healthy
// check and a compact badge list otherwise.
function DegradedComponentsCell({ row }: { row: HealthCheckResponse }) {
  const degraded = Object.entries(row.components).filter(
    ([, health]) => health.status !== "UP"
  )

  if (degraded.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {degraded.map(([key, health]) => (
        <span className="flex items-center gap-1 text-xs" key={key}>
          <span className="text-muted-foreground">
            {getComponentLabel(key)}:
          </span>
          <HealthStatusBadge status={health.status} />
        </span>
      ))}
    </div>
  )
}

// Past health-check results, populated by the backend's scheduled job
// (~every 5 min per the UNISAGE-62 contract draft) - a read-only,
// paginated log, same shape as AuditLogList but without any filters since
// there's nothing to filter a status history by yet.
export function HealthHistorySection() {
  const [page, setPage] = useState(1)

  const { data, error, isPending } = useSystemHealthHistoryQuery({
    limit: PAGE_SIZE,
    page,
  })

  const rows = useMemo(() => data?.data ?? [], [data])

  const columns = useMemo<ColumnDef<HealthCheckResponse, unknown>[]>(
    () => [
      {
        cell: ({ row }) => formatDateTime(row.original.checkedAt),
        header: "Thời gian kiểm tra",
        id: "checkedAt",
        meta: { className: "text-sm whitespace-nowrap" },
      },
      {
        cell: ({ row }) => (
          <HealthStatusBadge status={row.original.overallStatus} />
        ),
        header: "Trạng thái tổng thể",
        id: "overallStatus",
      },
      {
        cell: ({ row }) => <DegradedComponentsCell row={row.original} />,
        header: "Thành phần bất thường",
        id: "degradedComponents",
      },
    ],
    []
  )

  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold">Lịch sử kiểm tra</p>
        <p className="text-sm text-muted-foreground">
          Kết quả kiểm tra tình trạng hệ thống theo thời gian, được ghi nhận
          định kỳ.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        {isPending ? (
          <div aria-label="Đang tải lịch sử kiểm tra" className="space-y-2 p-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : error ? (
          <p className="m-4 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {getErrorMessage(error)}
          </p>
        ) : rows.length === 0 ? (
          <SearchEmpty
            description="Chưa có kết quả kiểm tra định kỳ nào được ghi nhận."
            title="Chưa có lịch sử kiểm tra"
          />
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable
                columns={columns}
                data={rows}
                getRowId={(row) => row.checkedAt}
              />
            </div>
            <div className="grid gap-3 p-3 md:hidden">
              {rows.map((row) => (
                <article className="rounded-xl border p-4" key={row.checkedAt}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">
                      {formatDateTime(row.checkedAt)}
                    </p>
                    <HealthStatusBadge status={row.overallStatus} />
                  </div>
                  <div className="mt-2">
                    <DegradedComponentsCell row={row} />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {data ? (
        <Pagination
          currentPage={page}
          onPageChange={setPage}
          pageSize={PAGE_SIZE}
          totalItems={data.totalItems}
          totalPages={data.totalPages}
        />
      ) : null}
    </div>
  )
}
