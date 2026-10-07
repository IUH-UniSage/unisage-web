import { LifeBuoy } from "lucide-react"
import { useState } from "react"

import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { DialogTourButton } from "@/features/product-tour"
import { TicketDetailContent } from "@/features/support-tickets/components/ticket-detail-content"
import { TicketStatusBadge } from "@/features/support-tickets/components/ticket-status-badge"
import {
  useMyTicketQuery,
  useMyTicketsQuery,
} from "@/features/support-tickets/queries/use-queries"
import {
  TICKET_STATUS_LABELS,
  TICKET_TYPE_LABELS,
  ticketStatusSchema,
  type TicketStatus,
} from "@/features/support-tickets/schemas/ticket-schemas"
import { formatAuditDate } from "@/utils/date-format"
import { getErrorMessage } from "@/utils/error-handler"

const PAGE_SIZE = 10
const ALL_STATUSES = "ALL"

function TicketDetailDialog({
  onClose,
  ticketId,
}: {
  onClose: () => void
  ticketId: string
}) {
  const { data: ticket, error } = useMyTicketQuery(ticketId)

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTourButton tourKey="my-ticket-detail" />
        <DialogHeader {...tourAnchor(TOUR_ANCHORS.dialogHeader)}>
          <DialogTitle>{ticket?.title ?? "Chi tiết yêu cầu"}</DialogTitle>
          <DialogDescription>
            Theo dõi tình trạng xử lý yêu cầu hỗ trợ của bạn.
          </DialogDescription>
        </DialogHeader>
        {ticket ? (
          <div {...tourAnchor(TOUR_ANCHORS.ticketDetailContent)}>
            <TicketDetailContent ticket={ticket} />
          </div>
        ) : error ? (
          <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {getErrorMessage(error)}
          </p>
        ) : (
          <Skeleton className="h-64 rounded-xl" />
        )}
      </DialogContent>
    </Dialog>
  )
}

// Client-facing "My support requests": banner + list card, same look as the
// profile page.
export function MyTickets() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<TicketStatus>()
  const [openTicketId, setOpenTicketId] = useState<string>()
  const { data, error, isPending } = useMyTicketsQuery({
    page,
    size: PAGE_SIZE,
    status,
  })
  const tickets = data?.data ?? []

  return (
    <div className="mx-auto mt-6 mb-8 w-full max-w-[1200px] space-y-6 px-4">
      <div
        {...tourAnchor(TOUR_ANCHORS.pageHeader)}
        className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-primary to-primary/75 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white/15 text-white">
            <LifeBuoy aria-hidden="true" className="size-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white/80">Hỗ trợ sinh viên</p>
            <h1 className="truncate text-2xl font-bold text-white">
              Yêu cầu hỗ trợ của tôi
            </h1>
            <p className="text-sm text-white/80">
              {data ? `${data.totalItems} yêu cầu` : "Đang tải..."}
            </p>
          </div>
        </div>
      </div>

      <Card className="border bg-card shadow-none">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-base font-semibold">
              Danh sách yêu cầu
            </CardTitle>
            <CardDescription>
              Bấm vào một yêu cầu để xem chi tiết và phản hồi từ cán bộ.
            </CardDescription>
          </div>
          <Select
            onValueChange={(value) => {
              setStatus(
                value === ALL_STATUSES ? undefined : (value as TicketStatus)
              )
              setPage(1)
            }}
            value={status ?? ALL_STATUSES}
          >
            <SelectTrigger
              {...tourAnchor(TOUR_ANCHORS.myTicketFilter)}
              aria-label="Lọc theo trạng thái"
              className="w-full sm:w-52"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>Tất cả trạng thái</SelectItem>
              {ticketStatusSchema.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {TICKET_STATUS_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent
          {...tourAnchor(TOUR_ANCHORS.myTicketList)}
          className="space-y-4"
        >
          {isPending ? (
            <div aria-label="Đang tải yêu cầu" className="space-y-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          ) : error ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
              {getErrorMessage(error)}
            </p>
          ) : tickets.length === 0 ? (
            <SearchEmpty
              description="Bạn có thể báo cáo một câu trả lời của trợ lý bằng biểu tượng lá cờ dưới câu trả lời trong khung chat."
              title={
                status
                  ? "Không có yêu cầu nào ở trạng thái này"
                  : "Bạn chưa có yêu cầu hỗ trợ nào"
              }
            />
          ) : (
            <ul className="space-y-3">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <button
                    className="w-full rounded-xl border bg-muted/20 p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    onClick={() => setOpenTicketId(ticket.id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 font-semibold break-words">
                        {ticket.title}
                      </p>
                      <TicketStatusBadge status={ticket.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {ticket.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {TICKET_TYPE_LABELS[ticket.type]} ·{" "}
                      {formatAuditDate(ticket.createdAt)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {data ? (
            <Pagination
              currentPage={page}
              onPageChange={setPage}
              pageSize={PAGE_SIZE}
              totalItems={data.totalItems}
              totalPages={data.totalPages}
            />
          ) : null}
        </CardContent>
      </Card>

      {openTicketId ? (
        <TicketDetailDialog
          onClose={() => setOpenTicketId(undefined)}
          ticketId={openTicketId}
        />
      ) : null}
    </div>
  )
}
