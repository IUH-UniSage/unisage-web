import { Database, RefreshCw, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { useEmbeddingIndexQuery } from "@/features/chat-models/queries/use-queries"
import {
  type EmbeddingReindexRun,
  type EmbeddingReindexStatus,
  isOpenReindexRun,
} from "@/features/chat-models/schemas/embedding-index-schemas"
import { formatDateTime } from "@/utils/date"

const RUN_STATUS_LABELS: Record<EmbeddingReindexStatus, string> = {
  CANCELLED: "Đã huỷ",
  FAILED: "Thất bại",
  QUEUED: "Đang chờ worker",
  RUNNING: "Đang re-index",
  SUCCEEDED: "Hoàn tất",
}

const RUN_STATUS_VARIANTS: Record<
  EmbeddingReindexStatus,
  "default" | "destructive" | "outline" | "secondary"
> = {
  CANCELLED: "outline",
  FAILED: "destructive",
  QUEUED: "secondary",
  RUNNING: "default",
  SUCCEEDED: "secondary",
}

type EmbeddingIndexPanelProps = {
  canReindex: boolean
  isCancelling: boolean
  onCancel: (run: EmbeddingReindexRun) => void
  onStartReindex: () => void
}

export function EmbeddingIndexPanel({
  canReindex,
  isCancelling,
  onCancel,
  onStartReindex,
}: EmbeddingIndexPanelProps) {
  const indexQuery = useEmbeddingIndexQuery()

  if (indexQuery.isPending) {
    return <Skeleton className="h-28 rounded-xl" />
  }
  if (!indexQuery.data) return null

  const index = indexQuery.data
  const run = index.currentRun ?? index.lastRun
  const isRunOpen = isOpenReindexRun(index.currentRun)

  return (
    <section
      aria-label="Chỉ mục embedding"
      className="rounded-xl border bg-card p-4 shadow-xs sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Database aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="text-sm font-semibold">Chỉ mục embedding</h2>
            <p className="text-sm break-words text-muted-foreground">
              {index.activeModel
                ? `Đang dùng ${index.activeModel.displayName || index.activeModel.llmModelName}`
                : "Chưa có mô hình embedding nào đang hoạt động"}
              {index.activeIdentity
                ? ` · ${index.activeIdentity.dimension} chiều`
                : " · chưa nạp dữ liệu"}
            </p>
            <dl className="grid gap-x-3 gap-y-1 pt-1 text-xs sm:grid-cols-[auto_minmax(0,1fr)]">
              <dt className="text-muted-foreground">Collection đang dùng</dt>
              <dd className="font-mono font-medium break-all text-foreground">
                {index.activeCollection}
              </dd>
              {index.activeCollection !== index.baseCollection ? (
                <>
                  <dt className="text-muted-foreground">Collection gốc</dt>
                  <dd className="font-mono break-all text-muted-foreground">
                    {index.baseCollection}
                  </dd>
                </>
              ) : null}
              {isRunOpen && index.currentRun ? (
                <>
                  <dt className="text-muted-foreground">Đang re-index sang</dt>
                  <dd className="font-mono break-all text-muted-foreground">
                    {index.currentRun.targetCollection}
                  </dd>
                </>
              ) : null}
            </dl>
          </div>
        </div>

        {canReindex ? (
          isRunOpen && index.currentRun ? (
            <Button
              className="cursor-pointer gap-2 sm:self-start"
              disabled={isCancelling}
              onClick={() => index.currentRun && onCancel(index.currentRun)}
              variant="outline"
            >
              <X aria-hidden="true" className="size-4" />
              {isCancelling ? "Đang huỷ..." : "Huỷ re-index"}
            </Button>
          ) : (
            <Button
              className="cursor-pointer gap-2 sm:self-start"
              onClick={onStartReindex}
              variant="outline"
            >
              <RefreshCw aria-hidden="true" className="size-4" />
              Re-index
            </Button>
          )
        ) : null}
      </div>

      {run ? <ReindexRunSummary isOpen={isRunOpen} run={run} /> : null}
    </section>
  )
}

function ReindexRunSummary({
  isOpen,
  run,
}: {
  isOpen: boolean
  run: EmbeddingReindexRun
}) {
  const percent =
    run.totalPoints && run.totalPoints > 0
      ? Math.round((run.processedPoints / run.totalPoints) * 100)
      : 0
  const finishedAt = run.finishedAt ? formatDateTime(run.finishedAt) : null

  return (
    <div className="mt-4 space-y-2 border-t pt-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant={RUN_STATUS_VARIANTS[run.status]}>
          {RUN_STATUS_LABELS[run.status]}
        </Badge>
        <span className="min-w-0 break-words text-muted-foreground">
          {run.rebuild ? "xây lại chỉ mục (thêm BM25) với " : "sang "}
          {run.targetModel.displayName || run.targetModel.llmModelName}
          {run.targetModel.embeddingDimension
            ? ` (${run.targetModel.embeddingDimension} chiều)`
            : ""}
          {!isOpen && finishedAt ? ` · ${finishedAt}` : ""}
        </span>
      </div>

      {isOpen ? (
        <div className="space-y-1">
          <ProgressBar value={percent} />
          <p className="text-xs text-muted-foreground">
            {run.totalPoints == null
              ? "Đang chờ worker nhận việc..."
              : `${run.processedPoints.toLocaleString("vi-VN")} / ${run.totalPoints.toLocaleString("vi-VN")} đoạn (${percent}%)`}
            {" · Tạm dừng embed tài liệu mới cho đến khi xong."}
          </p>
        </div>
      ) : null}

      {run.status === "FAILED" && run.errorMessage ? (
        <p className="text-sm break-words text-destructive">
          {run.errorMessage}
        </p>
      ) : null}
    </div>
  )
}
