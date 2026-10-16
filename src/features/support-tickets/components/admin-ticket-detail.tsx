import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ROUTES } from "@/constants/paths"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { TicketDetailContent } from "@/features/support-tickets/components/ticket-detail-content"
import {
  TicketContextChunks,
  TicketTraceInfo,
  TicketWebSources,
} from "@/features/support-tickets/components/ticket-retrieval-trace"
import { TicketStatusBadge } from "@/features/support-tickets/components/ticket-status-badge"
import { UpdateTicketForm } from "@/features/support-tickets/components/update-ticket-form"
import { useTicketQuery } from "@/features/support-tickets/queries/use-queries"
import { TICKET_TYPE_LABELS } from "@/features/support-tickets/schemas/ticket-schemas"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"
import { formatAuditDate } from "@/utils/date-format"
import { getErrorMessage } from "@/utils/error-handler"

// Full-width staff view of one ticket, laid out like the role detail page:
// the report and what the answer was generated from on the left, the trace
// ids and the status form on the right.
export function AdminTicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { canUpdate } = useResourcePermissions("ticket")
  const { data: ticket, error, isPending } = useTicketQuery(ticketId ?? "")

  if (isPending) {
    return (
      <div aria-label="Đang tải chi tiết yêu cầu" className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {error ? getErrorMessage(error) : "Không tìm thấy yêu cầu hỗ trợ."}
        </p>
        <Button asChild variant="outline">
          <Link to={ROUTES.adminTickets}>
            <ArrowLeft aria-hidden="true" className="mr-2 size-4" />
            Quay lại danh sách yêu cầu
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div
        {...tourAnchor(TOUR_ANCHORS.pageHeader)}
        className="flex items-start gap-3"
      >
        <Button
          asChild
          aria-label="Quay lại danh sách yêu cầu"
          className="mt-0.5 shrink-0"
          size="icon"
          variant="ghost"
        >
          <Link to={ROUTES.adminTickets}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Hỗ trợ
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold break-words md:text-3xl">
              {ticket.title}
            </h1>
            <TicketStatusBadge status={ticket.status} />
            <Badge variant="outline">{TICKET_TYPE_LABELS[ticket.type]}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Gửi bởi{" "}
            <span className="font-medium text-foreground">
              {ticket.userName || "—"}
            </span>
            {ticket.userEmail ? ` (${ticket.userEmail})` : null} · ngày{" "}
            {formatAuditDate(ticket.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <Card className="border bg-card shadow-none">
            <CardHeader className="border-b">
              <CardTitle className="text-base font-semibold">
                Nội dung báo cáo
              </CardTitle>
              <CardDescription>
                Mô tả của người dùng, câu hỏi gốc và câu trả lời bị báo cáo.
              </CardDescription>
            </CardHeader>
            <CardContent {...tourAnchor(TOUR_ANCHORS.ticketDetailContent)}>
              <TicketDetailContent showSummary={false} ticket={ticket} />
            </CardContent>
          </Card>

          <TicketContextChunks ticket={ticket} />
          <TicketWebSources ticket={ticket} />
        </div>

        <div className="min-w-0 space-y-6 xl:sticky xl:top-6">
          <TicketTraceInfo ticket={ticket} />

          {canUpdate ? (
            <Card className="border bg-card shadow-none">
              <CardHeader className="border-b">
                <CardTitle className="text-base font-semibold">
                  Cập nhật tiến độ & phản hồi
                </CardTitle>
                <CardDescription>
                  Đổi trạng thái xử lý và gửi phản hồi cho người dùng.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateTicketForm
                  key={`${ticket.id}-${ticket.updatedAt ?? ""}`}
                  ticket={ticket}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
