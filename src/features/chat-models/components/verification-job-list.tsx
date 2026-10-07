import type { ColumnDef } from "@tanstack/react-table"
import { useMemo, useState } from "react"

import { RefreshButton } from "@/components/shared/refresh-button"
import { CopyableId } from "@/components/shared/copyable-id"
import { DataTable } from "@/components/shared/list/data-table"
import { EntityActionsMenu } from "@/components/shared/list/entity-actions-menu"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { FailureMessagePanel } from "@/features/chat-models/components/failure-message-panel"
import { verificationJobKeys } from "@/features/chat-models/queries/keys"
import { useVerificationJobsQuery } from "@/features/chat-models/queries/use-queries"
import type { VerificationJob } from "@/features/chat-models/schemas/verification-job-schemas"
import { VERIFICATION_STATUSES } from "@/features/chat-models/schemas/verification-status"
import {
  getVerificationStatusBadgeClassName,
  getVerificationStatusLabel,
} from "@/features/chat-models/schemas/verification-status"
import {
  getPurposeLabel,
  parseFailureMessage,
} from "@/features/chat-models/utils/chat-model-formatters"
import { DialogTourButton } from "@/features/product-tour"
import { getErrorMessage } from "@/utils/error-handler"
import { formatDateTime } from "@/utils/date"

const PAGE_SIZE = 20
const ALL = "ALL"

function VerificationStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={getVerificationStatusBadgeClassName(status)}
      variant="ghost"
    >
      {getVerificationStatusLabel(status)}
    </Badge>
  )
}

function VerificationJobCandidateCell({ job }: { job: VerificationJob }) {
  return (
    <div className="min-w-0 text-sm">
      {job.chatModelDisplayName ? (
        <p className="font-semibold">{job.chatModelDisplayName}</p>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          Chưa đặt tên gợi nhớ
        </p>
      )}
      <p className="font-mono text-xs">{job.candidateLlmModelName || "—"}</p>
      <p className="text-xs text-muted-foreground">
        {job.candidateLlmProvider || "—"} · {getPurposeLabel(job.modelPurpose)}
      </p>
      <CopyableId className="mt-0.5" truncate value={job.chatModelId} />
    </div>
  )
}

function VerificationJobErrorCell({ job }: { job: VerificationJob }) {
  if (!job.errorCode && !job.errorMessage) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="max-w-xs text-sm">
      {job.errorCode ? (
        <p className="font-mono text-xs text-destructive">{job.errorCode}</p>
      ) : null}
      {job.errorMessage ? (
        <p className="line-clamp-2 text-xs wrap-break-word text-muted-foreground">
          {parseFailureMessage(job.errorMessage)?.summary ?? job.errorMessage}
        </p>
      ) : null}
    </div>
  )
}

function VerificationJobDetailDialog({ job }: { job: VerificationJob }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <EntityActionsMenu
        entityLabel="job xác minh"
        onDetail={() => setOpen(true)}
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogTourButton tourKey="verification-job-detail" />
        <DialogHeader {...tourAnchor(TOUR_ANCHORS.dialogHeader)}>
          <DialogTitle>
            Chi tiết job xác minh
            {job.chatModelDisplayName ? ` — ${job.chatModelDisplayName}` : ""}
          </DialogTitle>
          <DialogDescription>{formatDateTime(job.createdAt)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            {...tourAnchor(TOUR_ANCHORS.verificationJobStatus)}
            className="flex items-center justify-between gap-3"
          >
            <VerificationStatusBadge status={job.status} />
            <span className="text-xs text-muted-foreground">
              Lần thử {job.attempt}/{job.maxAttempts} · Gen{" "}
              {job.candidateGeneration} · Rev nền {job.baseRevision}
            </span>
          </div>

          <dl
            {...tourAnchor(TOUR_ANCHORS.verificationJobCandidate)}
            className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm"
          >
            <dt className="text-muted-foreground">Tên gợi nhớ</dt>
            <dd className="col-span-2 font-medium">
              {job.chatModelDisplayName || (
                <span className="font-normal text-muted-foreground">
                  Chưa đặt
                </span>
              )}
            </dd>
            <dt className="text-muted-foreground">Mô hình chat</dt>
            <dd className="col-span-2">
              <CopyableId value={job.chatModelId} />
            </dd>
            <dt className="text-muted-foreground">Mục đích</dt>
            <dd className="col-span-2">{getPurposeLabel(job.modelPurpose)}</dd>
            <dt className="text-muted-foreground">Nhà cung cấp (candidate)</dt>
            <dd className="col-span-2">{job.candidateLlmProvider || "—"}</dd>
            <dt className="text-muted-foreground">Tên mô hình (candidate)</dt>
            <dd className="col-span-2">{job.candidateLlmModelName || "—"}</dd>
            {job.candidateModelSourceRef ? (
              <>
                <dt className="text-muted-foreground">Tham chiếu nguồn</dt>
                <dd className="col-span-2">{job.candidateModelSourceRef}</dd>
              </>
            ) : null}
            <dt className="text-muted-foreground">API Base URL (candidate)</dt>
            <dd className="col-span-2 wrap-break-word">
              {job.candidateApiBaseUrl || "—"}
            </dd>
            <dt className="text-muted-foreground">API key (candidate)</dt>
            <dd className="col-span-2">
              {job.hasCandidateApiKey ? "Đã có" : "Chưa có"}
            </dd>
            {job.embeddingDimension != null ? (
              <>
                <dt className="text-muted-foreground">Embedding dimension</dt>
                <dd className="col-span-2">{job.embeddingDimension}</dd>
              </>
            ) : null}
            <dt className="text-muted-foreground">Bắt đầu</dt>
            <dd className="col-span-2">{formatDateTime(job.startedAt)}</dd>
            <dt className="text-muted-foreground">Kết thúc</dt>
            <dd className="col-span-2">{formatDateTime(job.finishedAt)}</dd>
            {job.nextAttemptAt ? (
              <>
                <dt className="text-muted-foreground">Lần thử tiếp theo</dt>
                <dd className="col-span-2">
                  {formatDateTime(job.nextAttemptAt)}
                </dd>
              </>
            ) : null}
          </dl>

          {job.errorMessage ? (
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">
                Lỗi{job.errorType ? ` (${job.errorType})` : ""}
                {job.errorCode ? ` — ${job.errorCode}` : ""}
              </p>
              <FailureMessagePanel message={job.errorMessage} />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Read-only queue monitor over chat_model_verifications, mirroring
// AuditLogList's shape (server-filtered list, no create/edit/delete). No
// realtime polling on purpose - SA hits the refresh button to see new state.
export function VerificationJobList() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string | undefined>(undefined)

  const { data, error, isPending } = useVerificationJobsQuery(page, PAGE_SIZE, {
    status,
  })

  const jobs = useMemo(() => data?.data ?? [], [data])
  const firstRowNumber = (page - 1) * PAGE_SIZE + 1

  const columns = useMemo<ColumnDef<VerificationJob, unknown>[]>(
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
        cell: ({ row }) => <VerificationJobCandidateCell job={row.original} />,
        header: "Credential / mô hình (candidate)",
        id: "candidate",
      },
      {
        cell: ({ row }) => (
          <VerificationStatusBadge status={row.original.status} />
        ),
        header: "Trạng thái",
        id: "status",
      },
      {
        cell: ({ row }) =>
          `${row.original.attempt}/${row.original.maxAttempts}`,
        header: "Lần thử",
        id: "attempt",
        meta: { className: "text-sm whitespace-nowrap" },
      },
      {
        cell: ({ row }) => <VerificationJobErrorCell job={row.original} />,
        header: "Lỗi",
        id: "error",
      },
      {
        cell: ({ row }) => formatDateTime(row.original.createdAt),
        header: "Thời gian tạo",
        id: "createdAt",
        meta: { className: "text-sm whitespace-nowrap" },
      },
      {
        cell: ({ row }) => <VerificationJobDetailDialog job={row.original} />,
        header: "Hành động",
        id: "actions",
        meta: { className: "text-right", headerClassName: "text-right" },
      },
    ],
    [firstRowNumber]
  )

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <div className="flex items-center justify-between gap-2 border-b p-3">
          <p className="text-sm text-muted-foreground">
            Danh sách job xác minh credential (verify-before-active). Không tự
            cập nhật realtime — bấm làm mới để xem trạng thái mới nhất.
          </p>
          <div className="flex shrink-0 gap-2">
            <Select
              onValueChange={(value) => {
                setStatus(value === ALL ? undefined : value)
                setPage(1)
              }}
              value={status ?? ALL}
            >
              <SelectTrigger
                aria-label="Lọc theo trạng thái"
                className="w-48 shrink-0"
              >
                <SelectValue placeholder="Mọi trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Mọi trạng thái</SelectItem>
                {VERIFICATION_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {getVerificationStatusLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <RefreshButton
              label="Làm mới danh sách job xác minh"
              queryKeys={[verificationJobKeys.all]}
            />
          </div>
        </div>

        {isPending ? (
          <div
            aria-label="Đang tải danh sách job xác minh"
            className="space-y-2 p-4"
          >
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : error ? (
          <p className="m-4 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {getErrorMessage(error)}
          </p>
        ) : jobs.length === 0 ? (
          <SearchEmpty
            description={
              status
                ? "Thử đổi hoặc đặt lại bộ lọc trạng thái."
                : "Chưa có job xác minh nào được tạo."
            }
            title="Không tìm thấy job phù hợp"
          />
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={jobs}
              getRowId={(job) => job.id}
            />
          </div>
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
