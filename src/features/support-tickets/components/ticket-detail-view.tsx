import { ArrowLeft, LifeBuoy } from "lucide-react"
import { Link, useParams } from "react-router-dom"

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
import { UpdateTicketForm } from "@/features/support-tickets/components/update-ticket-form"
import {
  useMyTicketQuery,
  useTicketQuery,
} from "@/features/support-tickets/queries/use-queries"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"
import { getErrorMessage } from "@/utils/error-handler"

export function TicketDetailView() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { canRead, canUpdate } = useResourcePermissions("ticket")

  const myTicketQuery = useMyTicketQuery(ticketId ?? "")
  const adminTicketQuery = useTicketQuery(ticketId ?? "")

  const activeQuery = canRead ? adminTicketQuery : myTicketQuery
  const { data: ticket, error, isPending } = activeQuery

  const backPath = canRead ? ROUTES.adminTickets : ROUTES.tickets

  return (
    <div className="mx-auto mt-6 mb-8 w-full max-w-[1000px] space-y-6 px-4">
      <div
        {...tourAnchor(TOUR_ANCHORS.pageHeader)}
        className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-primary to-primary/75 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white/15 text-white">
            <LifeBuoy aria-hidden="true" className="size-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white/80">
              {canRead ? "Quản trị · Hỗ trợ" : "Hỗ trợ sinh viên"}
            </p>
            <h1 className="truncate text-2xl font-bold text-white">
              Chi tiết yêu cầu hỗ trợ
            </h1>
            <p className="truncate text-sm text-white/80">
              {ticket
                ? ticket.title
                : isPending
                  ? "Đang tải..."
                  : "Chi tiết yêu cầu"}
            </p>
          </div>
        </div>

        <Button
          asChild
          className="shrink-0 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          variant="outline"
        >
          <Link to={backPath}>
            <ArrowLeft aria-hidden="true" className="mr-2 size-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>

      <Card className="border bg-card shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {ticket?.title ?? "Nội dung yêu cầu"}
          </CardTitle>
          <CardDescription>
            {canRead
              ? "Xem thông tin yêu cầu và cập nhật tình trạng xử lý cho người dùng."
              : "Theo dõi tình trạng xử lý yêu cầu hỗ trợ của bạn."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isPending ? (
            <div aria-label="Đang tải chi tiết yêu cầu" className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
          ) : error ? (
            <div className="space-y-4">
              <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
                {getErrorMessage(error)}
              </p>
              <Button asChild variant="outline">
                <Link to={backPath}>
                  <ArrowLeft aria-hidden="true" className="mr-2 size-4" />
                  Quay lại danh sách yêu cầu
                </Link>
              </Button>
            </div>
          ) : ticket ? (
            <>
              <div {...tourAnchor(TOUR_ANCHORS.ticketDetailContent)}>
                <TicketDetailContent showRequester={canRead} ticket={ticket} />
              </div>

              {canUpdate ? (
                <div className="border-t pt-6">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">
                    Cập nhật tiến độ & phản hồi
                  </h3>
                  <UpdateTicketForm
                    key={`${ticket.id}-${ticket.updatedAt ?? ""}`}
                    ticket={ticket}
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
