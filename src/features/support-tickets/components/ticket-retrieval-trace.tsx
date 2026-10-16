import { ExternalLink, FileText, Globe, Link2, ScanSearch } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { CopyableId } from "@/components/shared/copyable-id"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { adminDocumentChunksPath } from "@/constants/paths"
import type {
  TicketContextChunk,
  TicketDetail,
  TicketWebSource,
} from "@/features/support-tickets/schemas/ticket-schemas"

const WEB_SOURCE_TYPE = "WEB"

// A ticket on an answer stored before the agent pushed traces has no context
// lists: fall back to what the answer cites ([n] markers), so staff still see
// the sources - without chunk text, scores or the uncited ones.
function chunksOf(ticket: TicketDetail): TicketContextChunk[] {
  if (ticket.contextChunks) return ticket.contextChunks
  return (ticket.citations ?? [])
    .filter((citation) => citation.sourceType !== WEB_SOURCE_TYPE)
    .map((citation) => ({ ...citation, cited: true }))
}

function webSourcesOf(ticket: TicketDetail): TicketWebSource[] {
  if (ticket.webSources) return ticket.webSources
  return (ticket.citations ?? [])
    .filter((citation) => citation.sourceType === WEB_SOURCE_TYPE)
    .map((citation) => ({ ...citation, cited: true, kind: "CONTENT" }))
}

function formatPages(start?: number | null, end?: number | null) {
  if (start == null) return null
  return end != null && end !== start ? `tr. ${start}–${end}` : `tr. ${start}`
}

function formatScore(score?: number | null) {
  return score == null ? null : `điểm ${score.toFixed(2)}`
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

function IndexBadge({ index }: { index?: number | null }) {
  return (
    <Badge className="font-mono" variant="secondary">
      {index != null ? `[${index}]` : "link"}
    </Badge>
  )
}

function CitedBadge({ cited }: { cited?: boolean | null }) {
  return cited ? (
    <Badge className="bg-success/15 text-success">Được trích dẫn</Badge>
  ) : (
    <Badge variant="outline">Không trích dẫn</Badge>
  )
}

function Meta({ parts }: { parts: (string | null | undefined)[] }) {
  const shown = parts.filter(Boolean)
  if (shown.length === 0) return null
  return (
    <p className="text-xs font-normal text-muted-foreground">
      {shown.join(" · ")}
    </p>
  )
}

function SourceText({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <p className="max-h-72 overflow-y-auto rounded-lg border bg-muted/30 p-3 text-sm leading-6 break-words whitespace-pre-wrap">
      {text}
    </p>
  )
}

function TraceCard({
  children,
  count,
  description,
  icon,
  title,
}: {
  children: ReactNode
  count: string
  description: string
  icon: ReactNode
  title: string
}) {
  return (
    <Card className="border bg-card shadow-none">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center gap-2">
          {icon}
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <Badge className="font-mono" variant="secondary">
            {count}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function LegacyNotice({ ticket }: { ticket: TicketDetail }) {
  if (ticket.contextChunks || ticket.webSources) return null
  return (
    <p className="mb-3 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
      Câu trả lời này được tạo trước khi hệ thống lưu vết truy xuất: chỉ hiển
      thị các nguồn được trích dẫn, không có nội dung chunk và điểm.
    </p>
  )
}

function EmptyList({ children }: { children: ReactNode }) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground italic">
      {children}
    </p>
  )
}

export function TicketContextChunks({ ticket }: { ticket: TicketDetail }) {
  const chunks = chunksOf(ticket)
  const citedCount = chunks.filter((chunk) => chunk.cited).length

  return (
    <TraceCard
      count={`${citedCount} / ${chunks.length} được trích dẫn`}
      description="Các đoạn tài liệu đã đưa vào prompt cho LLM để sinh câu trả lời, theo thứ tự đánh số [n]."
      icon={<FileText aria-hidden="true" className="size-5 text-primary" />}
      title="Chunks đã dùng"
    >
      <LegacyNotice ticket={ticket} />
      {chunks.length === 0 ? (
        <EmptyList>
          Không có chunk nào được đưa vào prompt (chào hỏi, ngoài phạm vi, hoặc
          bước rerank đã loại hết).
        </EmptyList>
      ) : (
        <Accordion type="multiple">
          {chunks.map((chunk, position) => (
            <AccordionItem
              key={chunk.chunkId ?? `${chunk.index ?? "x"}-${position}`}
              value={chunk.chunkId ?? String(position)}
            >
              <AccordionTrigger className="gap-3 py-3 hover:no-underline">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <IndexBadge index={chunk.index} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-semibold break-words">
                      {chunk.title || "Tài liệu không tên"}
                    </p>
                    <Meta
                      parts={[
                        chunk.section,
                        formatPages(chunk.pageStart, chunk.pageEnd),
                        formatScore(chunk.score),
                        chunk.sourceType,
                      ]}
                    />
                  </div>
                  <CitedBadge cited={chunk.cited} />
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                {chunk.headingPath && chunk.headingPath.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {chunk.headingPath.join(" › ")}
                  </p>
                ) : null}
                <SourceText text={chunk.content} />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  {chunk.chunkId ? (
                    <span className="inline-flex min-w-0 items-center gap-1 text-muted-foreground">
                      Chunk ID: <CopyableId value={chunk.chunkId} />
                    </span>
                  ) : null}
                  {chunk.documentId ? (
                    <Link
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                      to={adminDocumentChunksPath(chunk.documentId)}
                    >
                      <ExternalLink aria-hidden="true" className="size-3" />
                      Xem chunks của tài liệu
                    </Link>
                  ) : null}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </TraceCard>
  )
}

export function TicketWebSources({ ticket }: { ticket: TicketDetail }) {
  const pages = webSourcesOf(ticket)
  const citedCount = pages.filter((page) => page.cited).length

  return (
    <TraceCard
      count={`${citedCount} / ${pages.length} được trích dẫn`}
      description="Trang web từ bước tìm kiếm web: nội dung được đưa vào prompt, hoặc chỉ được gửi kèm dưới dạng link tham khảo."
      icon={<Globe aria-hidden="true" className="size-5 text-primary" />}
      title="Link web đã dùng"
    >
      {pages.length === 0 ? (
        <EmptyList>Câu trả lời này không dùng trang web nào.</EmptyList>
      ) : (
        <ul className="divide-y">
          {pages.map((page, position) => (
            <li
              className="space-y-2 py-3 first:pt-0 last:pb-0"
              key={`${page.url ?? "x"}-${position}`}
            >
              <div className="flex items-start gap-2">
                <IndexBadge index={page.index} />
                <div className="min-w-0 flex-1 space-y-1">
                  {page.url ? (
                    <a
                      className="inline-flex max-w-full items-start gap-1 font-semibold break-words text-primary hover:underline"
                      href={page.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="min-w-0">{page.title || page.url}</span>
                      <ExternalLink
                        aria-hidden="true"
                        className="mt-1 size-3 shrink-0"
                      />
                    </a>
                  ) : (
                    <p className="font-semibold break-words">
                      {page.title || "Trang không tên"}
                    </p>
                  )}
                  <Meta
                    parts={[
                      page.url ? hostOf(page.url) : null,
                      page.kind === "LINK"
                        ? "Chỉ gửi link"
                        : "Nội dung trong prompt",
                      formatScore(page.score),
                    ]}
                  />
                </div>
                <CitedBadge cited={page.cited} />
              </div>
              {page.content ? (
                <details className="group pl-9 text-sm">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    Xem đoạn trích đã đưa vào prompt
                  </summary>
                  <div className="mt-2">
                    <SourceText text={page.content} />
                  </div>
                </details>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </TraceCard>
  )
}

function TraceRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm">
        {value ? (
          <CopyableId className="text-sm text-foreground" value={value} />
        ) : (
          <span className="text-muted-foreground italic">Không có</span>
        )}
      </dd>
    </div>
  )
}

export function TicketTraceInfo({ ticket }: { ticket: TicketDetail }) {
  return (
    <Card className="border bg-card shadow-none">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <ScanSearch aria-hidden="true" className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">Truy vết</CardTitle>
        </div>
        <CardDescription>
          Dùng Trace ID để lọc toàn bộ log của agent cho đúng lượt trả lời này.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <TraceRow label="Trace ID" value={ticket.traceId} />
          <TraceRow label="Message ID" value={ticket.messageId} />
          <TraceRow label="Conversation ID" value={ticket.conversationId} />
        </dl>
        {ticket.traceId ? (
          <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-muted/40 px-3 py-2 font-mono text-xs break-all text-muted-foreground">
            <Link2 aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
            grep {ticket.traceId} agent.log
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
