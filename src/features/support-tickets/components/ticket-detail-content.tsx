import type { ReactNode } from "react"

import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import { Badge } from "@/components/ui/badge"
import { TicketStatusBadge } from "@/features/support-tickets/components/ticket-status-badge"
import {
  TICKET_TYPE_LABELS,
  type TicketDetail,
} from "@/features/support-tickets/schemas/ticket-schemas"
import { formatAuditDate } from "@/utils/date-format"

function Block({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="rounded-lg border bg-muted/30 p-3.5 text-sm leading-6">
        {children}
      </div>
    </section>
  )
}

// Read-only view of one ticket, shared by the user's "my tickets" dialog and
// the admin dialog (which also shows who filed it).
export function TicketDetailContent({
  showRequester = false,
  ticket,
}: {
  showRequester?: boolean
  ticket: TicketDetail
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <TicketStatusBadge status={ticket.status} />
        <Badge variant="outline">{TICKET_TYPE_LABELS[ticket.type]}</Badge>
        <span className="text-xs text-muted-foreground">
          Gửi ngày {formatAuditDate(ticket.createdAt)}
        </span>
      </div>

      {showRequester ? (
        <p className="text-sm text-muted-foreground">
          Người gửi:{" "}
          <span className="font-medium text-foreground">
            {ticket.userName || "—"}
          </span>
          {ticket.userEmail ? ` (${ticket.userEmail})` : null}
        </p>
      ) : null}

      <Block title="Mô tả vấn đề">
        <p className="break-words whitespace-pre-wrap">{ticket.description}</p>
      </Block>

      <Block title="Câu hỏi của người dùng">
        {ticket.questionContent ? (
          <p className="break-words whitespace-pre-wrap">
            {ticket.questionContent}
          </p>
        ) : (
          <p className="text-muted-foreground italic">Không xác định.</p>
        )}
      </Block>

      <Block title="Câu trả lời được báo cáo">
        <div className="max-h-56 overflow-y-auto">
          <MarkdownRenderer content={ticket.messageContent ?? ""} />
        </div>
      </Block>

      <Block title="Phản hồi từ cán bộ">
        {ticket.resolution ? (
          <p className="break-words whitespace-pre-wrap">{ticket.resolution}</p>
        ) : (
          <p className="text-muted-foreground italic">Chưa có phản hồi.</p>
        )}
      </Block>
    </div>
  )
}
