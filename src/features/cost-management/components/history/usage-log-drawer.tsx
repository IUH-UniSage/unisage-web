import type { ColumnDef } from "@tanstack/react-table"
import type { ReactNode } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  citationSchema,
  type Citation,
} from "@/features/chat/schemas/chat-schemas"
import { useUsageLogQuery } from "@/features/cost-management/queries/use-queries"
import type {
  UsageLine,
  UsageLogDetail,
} from "@/features/cost-management/schemas/cost-management-schemas"
import { formatUsdPrecise } from "@/features/cost-management/utils/format-cost"
import { getUsagePurposeLabel } from "@/features/cost-management/utils/purpose-labels"
import {
  formatLatency,
  formatTokens,
  getUsageRequesterLabel,
  getUsageTotalCost,
} from "@/features/cost-management/utils/usage-display"
import {
  getUsageCostStatusLabel,
  getUsageRequestStatusBadgeClassName,
  getUsageRequestStatusLabel,
} from "@/features/cost-management/utils/usage-labels"
import { formatDateTime } from "@/utils/date"
import { getErrorMessage } from "@/utils/error-handler"

const DELETED_CONTENT = "Nội dung đã bị xoá"

const LINE_COLUMNS: ColumnDef<UsageLine, unknown>[] = [
  {
    cell: ({ row }) => row.original.seq,
    header: "#",
    id: "seq",
    meta: { className: "text-xs text-muted-foreground w-8" },
  },
  {
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.nodeName}</span>
    ),
    header: "Node",
    id: "node",
  },
  {
    cell: ({ row }) => (
      <div className="text-xs">
        <p>{row.original.modelName ?? "-"}</p>
        <p className="text-muted-foreground">{row.original.provider ?? "-"}</p>
      </div>
    ),
    header: "Mô hình",
    id: "model",
  },
  {
    cell: ({ row }) =>
      row.original.attempt > 0 ? (
        <Badge
          className="border-transparent bg-warning/40 text-warning-foreground"
          variant="ghost"
        >
          failover #{row.original.attempt}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">lần đầu</span>
      ),
    header: "Lượt",
    id: "attempt",
  },
  {
    cell: ({ row }) =>
      `${formatTokens(row.original.inputTokens)} / ${formatTokens(row.original.outputTokens)}`,
    header: "Token vào / ra",
    id: "tokens",
    meta: {
      className: "text-right text-xs whitespace-nowrap",
      headerClassName: "text-right",
    },
  },
  {
    cell: ({ row }) => {
      const line = row.original
      const cost =
        line.costStatus === "UNPRICED"
          ? `≈ ${formatUsdPrecise(line.estimatedCostUsd)}`
          : formatUsdPrecise(line.costUsd ?? 0)
      return (
        <div className="text-right text-xs">
          <p className="whitespace-nowrap">{cost}</p>
          <p className="text-muted-foreground">
            {getUsageCostStatusLabel(line.costStatus)}
          </p>
        </div>
      )
    },
    header: "Chi phí",
    id: "cost",
    meta: { headerClassName: "text-right" },
  },
  {
    cell: ({ row }) => formatLatency(row.original.latencyMs),
    header: "Độ trễ",
    id: "latency",
    meta: {
      className: "text-right text-xs whitespace-nowrap",
      headerClassName: "text-right",
    },
  },
  {
    cell: ({ row }) =>
      row.original.status === "SUCCESS" ? (
        <span className="text-xs text-success">OK</span>
      ) : (
        <span className="text-xs text-destructive">
          {row.original.errorCode ??
            getUsageRequestStatusLabel(row.original.status)}
        </span>
      ),
    header: "Lỗi",
    id: "error",
  },
]

// Citations are stored as free-form JSON on the message; skip entries that
// don't match the chat citation shape instead of failing the whole drawer.
function parseCitations(raw: UsageLogDetail["citations"]): Citation[] {
  return (raw ?? []).flatMap((item) => {
    const parsed = citationSchema.safeParse(item)
    return parsed.success ? [parsed.data] : []
  })
}

function formatCitationPages(citation: Citation): string | null {
  if (citation.pageStart == null) return null
  return citation.pageEnd != null && citation.pageEnd !== citation.pageStart
    ? `tr. ${citation.pageStart}-${citation.pageEnd}`
    : `tr. ${citation.pageStart}`
}

function Field({ label, children }: { children: ReactNode; label: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm break-words">{children}</dd>
    </div>
  )
}

function MessageBlock({
  content,
  isChat,
  title,
}: {
  content: string | null
  isChat: boolean
  title: string
}) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-sm font-medium">{title}</h3>
      {content ? (
        <p className="max-h-48 overflow-y-auto rounded-lg border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
          {content}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          {isChat ? DELETED_CONTENT : "Không áp dụng cho loại request này"}
        </p>
      )}
    </section>
  )
}

function UsageLogDetailBody({ detail }: { detail: UsageLogDetail }) {
  const isChat = detail.purpose === "CHAT"
  const citations = parseCitations(detail.citations)
  const total = getUsageTotalCost(detail)

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Thời điểm">{formatDateTime(detail.startedAt)}</Field>
        <Field label="Người dùng / IP">{getUsageRequesterLabel(detail)}</Field>
        <Field label="Mục đích">{getUsagePurposeLabel(detail.purpose)}</Field>
        <Field label="Trạng thái">
          <Badge
            className={getUsageRequestStatusBadgeClassName(detail.status)}
            variant="ghost"
          >
            {getUsageRequestStatusLabel(detail.status)}
          </Badge>
        </Field>
        <Field label="Tổng chi phí">
          {total.approximate ? "≈ " : ""}
          {formatUsdPrecise(total.value)}
          {detail.unpricedLineCount > 0 ? (
            <span className="block text-xs text-muted-foreground">
              {detail.unpricedLineCount} lượt gọi chưa định giá (ước tính)
            </span>
          ) : null}
        </Field>
        <Field label="Độ trễ">{formatLatency(detail.latencyMs)}</Field>
        <Field label="Token vào / ra / cache">
          {formatTokens(detail.totalInputTokens)} /{" "}
          {formatTokens(detail.totalOutputTokens)} /{" "}
          {formatTokens(detail.totalCachedTokens)}
        </Field>
        <div className="col-span-2">
          <Field label="Request ID">
            <span className="font-mono text-xs">{detail.requestId}</span>
          </Field>
        </div>
      </dl>

      <MessageBlock content={detail.query} isChat={isChat} title="Câu hỏi" />
      <MessageBlock
        content={detail.answer}
        isChat={isChat}
        title="Câu trả lời"
      />

      {citations.length > 0 ? (
        <section className="space-y-1.5">
          <h3 className="text-sm font-medium">Trích dẫn</h3>
          <ol className="space-y-1 text-sm">
            {citations.map((citation) => (
              <li className="flex gap-2" key={citation.index}>
                <span className="text-muted-foreground">
                  [{citation.index}]
                </span>
                <span className="min-w-0">
                  {citation.title}
                  {citation.section ? ` · ${citation.section}` : ""}
                  {formatCitationPages(citation)
                    ? ` · ${formatCitationPages(citation)}`
                    : ""}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="space-y-1.5">
        <h3 className="text-sm font-medium">
          Các lượt gọi nhà cung cấp ({detail.lines.length})
        </h3>
        <div className="overflow-x-auto rounded-lg border">
          <DataTable
            columns={LINE_COLUMNS}
            data={detail.lines}
            getRowId={(line) => String(line.seq)}
          />
        </div>
      </section>
    </div>
  )
}

type UsageLogDrawerProps = {
  onOpenChange: (open: boolean) => void
  usageLogId: string | undefined
}

export function UsageLogDrawer({
  onOpenChange,
  usageLogId,
}: UsageLogDrawerProps) {
  const detailQuery = useUsageLogQuery(usageLogId ?? "")

  return (
    <Sheet onOpenChange={onOpenChange} open={Boolean(usageLogId)}>
      <SheetContent className="w-full overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Chi tiết request</SheetTitle>
          <SheetDescription>
            Chi phí, token và từng lượt gọi nhà cung cấp của request.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          {detailQuery.isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-32" />
              <Skeleton className="h-40" />
            </div>
          ) : detailQuery.isError ? (
            <p className="text-sm text-destructive">
              {getErrorMessage(detailQuery.error)}
            </p>
          ) : (
            <UsageLogDetailBody detail={detailQuery.data} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
