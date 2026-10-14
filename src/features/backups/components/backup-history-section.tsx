import { useState } from "react"

import { Pagination } from "@/components/shared/list/pagination"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useBackupRunsQuery,
  useRestoreRunsQuery,
} from "@/features/backups/queries/use-queries"
import {
  BACKUP_STATUS_LABELS,
  BACKUP_TYPE_LABELS,
  getBackupStatusBadgeClassName,
  RESTORE_TYPE_LABELS,
  type BackupStatus,
  type RestoreRun,
} from "@/features/backups/schemas/backup-schemas"
import { formatDateTime } from "@/utils/date"
import { formatFileSize } from "@/utils/file-size"
import { getErrorMessage } from "@/utils/error-handler"

const PAGE_SIZE = 10

function StatusBadge({ status }: { status: BackupStatus }) {
  return (
    <Badge className={getBackupStatusBadgeClassName(status)}>
      {BACKUP_STATUS_LABELS[status]}
    </Badge>
  )
}

function durationLabel(startedAt: string, finishedAt?: string | null) {
  if (!finishedAt) return "-"
  const seconds = Math.max(
    0,
    Math.round((Date.parse(finishedAt) - Date.parse(startedAt)) / 1000)
  )
  if (Number.isNaN(seconds)) return "-"
  return seconds < 60
    ? `${seconds} giây`
    : `${Math.floor(seconds / 60)} phút ${seconds % 60} giây`
}

function restoreTargetLabel(run: RestoreRun) {
  if (run.targetTime) return `Thời điểm ${formatDateTime(run.targetTime)}`
  return run.target ?? "-"
}

function HistoryState({
  error,
  isEmpty,
  isPending,
}: {
  error: unknown
  isEmpty: boolean
  isPending: boolean
}) {
  if (isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton className="h-9 w-full" key={index} />
        ))}
      </div>
    )
  }
  if (error) {
    return (
      <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
        {getErrorMessage(error)}
      </p>
    )
  }
  if (isEmpty) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
        Chưa có dữ liệu.
      </p>
    )
  }
  return null
}

function BackupRunsTable() {
  const [page, setPage] = useState(1)
  const { data, error, isPending } = useBackupRunsQuery({
    limit: PAGE_SIZE,
    page,
  })
  const runs = data?.data ?? []

  if (isPending || error || runs.length === 0) {
    return (
      <HistoryState
        error={error}
        isEmpty={runs.length === 0}
        isPending={isPending}
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Bắt đầu</TableHead>
              <TableHead>Thời lượng</TableHead>
              <TableHead className="text-right">Dung lượng</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {BACKUP_TYPE_LABELS[run.backupType]}
                  {run.target && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      {run.target}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={run.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDateTime(run.startedAt)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {durationLabel(run.startedAt, run.finishedAt)}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap tabular-nums">
                  {run.sizeBytes ? formatFileSize(run.sizeBytes) : "-"}
                </TableCell>
                <TableCell className="max-w-80 text-xs text-muted-foreground">
                  {run.status === "FAILED" ? (
                    <span
                      className="line-clamp-2 text-destructive"
                      title={run.errorMessage ?? undefined}
                    >
                      {run.errorMessage}
                    </span>
                  ) : run.purgedAt ? (
                    `Đã xóa theo chính sách giữ lại (${formatDateTime(run.purgedAt)})`
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={page}
          onPageChange={setPage}
          pageSize={PAGE_SIZE}
          totalItems={data.totalItems}
          totalPages={data.totalPages}
        />
      )}
    </div>
  )
}

function RestoreRunsTable() {
  const [page, setPage] = useState(1)
  const { data, error, isPending } = useRestoreRunsQuery({
    limit: PAGE_SIZE,
    page,
  })
  const runs = data?.data ?? []

  if (isPending || error || runs.length === 0) {
    return (
      <HistoryState
        error={error}
        isEmpty={runs.length === 0}
        isPending={isPending}
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Đối tượng</TableHead>
              <TableHead>Khôi phục về</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Bắt đầu</TableHead>
              <TableHead>Thời lượng</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {RESTORE_TYPE_LABELS[run.restoreType]}
                </TableCell>
                <TableCell
                  className="max-w-64 truncate"
                  title={restoreTargetLabel(run)}
                >
                  {restoreTargetLabel(run)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={run.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDateTime(run.startedAt)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {durationLabel(run.startedAt, run.finishedAt)}
                </TableCell>
                <TableCell>{run.requestedByCode ?? "-"}</TableCell>
                <TableCell className="max-w-80 text-xs">
                  {run.status === "FAILED" && run.errorMessage ? (
                    <span
                      className="line-clamp-2 text-destructive"
                      title={run.errorMessage}
                    >
                      {run.errorMessage}
                    </span>
                  ) : run.safetyRunId ? (
                    <span className="text-muted-foreground">
                      Đã tạo bản an toàn trước khi khôi phục
                    </span>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={page}
          onPageChange={setPage}
          pageSize={PAGE_SIZE}
          totalItems={data.totalItems}
          totalPages={data.totalPages}
        />
      )}
    </div>
  )
}

export function BackupHistorySection() {
  return (
    <Tabs defaultValue="runs">
      <TabsList>
        <TabsTrigger value="runs">Lịch sử sao lưu</TabsTrigger>
        <TabsTrigger value="restores">Lịch sử khôi phục</TabsTrigger>
      </TabsList>
      <TabsContent className="mt-3" value="runs">
        <BackupRunsTable />
      </TabsContent>
      <TabsContent className="mt-3" value="restores">
        <RestoreRunsTable />
      </TabsContent>
    </Tabs>
  )
}
