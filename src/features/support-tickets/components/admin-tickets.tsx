import type { ColumnDef } from "@tanstack/react-table"
import { Eye } from "lucide-react"
import { useMemo, useState } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { ListToolbar } from "@/components/shared/list/list-toolbar"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminTicketDialog } from "@/features/support-tickets/components/admin-ticket-dialog"
import { TicketStatusBadge } from "@/features/support-tickets/components/ticket-status-badge"
import { useTicketsQuery } from "@/features/support-tickets/queries/use-queries"
import {
  TICKET_STATUS_LABELS,
  TICKET_TYPE_LABELS,
  ticketStatusSchema,
  ticketTypeSchema,
  type Ticket,
  type TicketStatus,
  type TicketType,
} from "@/features/support-tickets/schemas/ticket-schemas"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"
import { formatAuditDate } from "@/utils/date-format"
import { getErrorMessage } from "@/utils/error-handler"

const PAGE_SIZE = 10
const ALL = "ALL"

type Filters = { q: string; status?: TicketStatus; type?: TicketType }

// Admin list: filters are drafted in the toolbar and applied with "Lọc",
// like the other admin lists.
export function AdminTickets() {
  const { canUpdate } = useResourcePermissions("ticket")
  const [page, setPage] = useState(1)
  const [draft, setDraft] = useState<Filters>({ q: "" })
  const [applied, setApplied] = useState<Filters>({ q: "" })
  const [openTicketId, setOpenTicketId] = useState<string>()
  const { data, error, isPending } = useTicketsQuery({
    page,
    size: PAGE_SIZE,
    ...applied,
  })
  const tickets = useMemo(() => data?.data ?? [], [data])
  const firstRowNumber = (page - 1) * PAGE_SIZE + 1
  const isFiltered = Boolean(applied.q || applied.status || applied.type)

  const columns = useMemo<ColumnDef<Ticket, unknown>[]>(
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
        cell: ({ row }) => (
          <div className="max-w-xs">
            <p className="truncate font-semibold">{row.original.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.description}
            </p>
          </div>
        ),
        header: "Tiêu đề",
        id: "title",
      },
      {
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-medium">{row.original.userName || "—"}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.userEmail}
            </p>
          </div>
        ),
        header: "Người gửi",
        id: "user",
      },
      {
        cell: ({ row }) => (
          <Badge variant="outline">
            {TICKET_TYPE_LABELS[row.original.type]}
          </Badge>
        ),
        header: "Loại",
        id: "type",
      },
      {
        cell: ({ row }) => formatAuditDate(row.original.createdAt),
        header: "Ngày gửi",
        id: "createdAt",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => <TicketStatusBadge status={row.original.status} />,
        header: "Trạng thái",
        id: "status",
      },
      {
        cell: ({ row }) => (
          <Button
            aria-label={`Xem yêu cầu ${row.original.title}`}
            onClick={() => setOpenTicketId(row.original.id)}
            size="icon-sm"
            variant="ghost"
          >
            <Eye aria-hidden="true" />
          </Button>
        ),
        header: "Hành động",
        id: "actions",
        meta: { className: "text-right", headerClassName: "text-right" },
      },
    ],
    [firstRowNumber]
  )

  const applyFilters = () => {
    setApplied({ ...draft, q: draft.q.trim() })
    setPage(1)
  }

  const resetFilters = () => {
    setDraft({ q: "" })
    setApplied({ q: "" })
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
          Quản trị · Hỗ trợ
        </p>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">Yêu cầu hỗ trợ</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Các câu trả lời của trợ lý mà người dùng báo cáo. Xem chi tiết, đổi
          trạng thái và phản hồi cho người gửi.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <ListToolbar
          isFiltered={isFiltered}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          onSearchChange={(q) => setDraft((current) => ({ ...current, q }))}
          search={draft.q}
          searchAriaLabel="Tìm yêu cầu hỗ trợ"
          searchPlaceholder="Tìm theo tiêu đề..."
        >
          <Select
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                status: value === ALL ? undefined : (value as TicketStatus),
              }))
            }
            value={draft.status ?? ALL}
          >
            <SelectTrigger aria-label="Lọc theo trạng thái" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi trạng thái</SelectItem>
              {ticketStatusSchema.options.map((status) => (
                <SelectItem key={status} value={status}>
                  {TICKET_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                type: value === ALL ? undefined : (value as TicketType),
              }))
            }
            value={draft.type ?? ALL}
          >
            <SelectTrigger aria-label="Lọc theo loại" className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi loại</SelectItem>
              {ticketTypeSchema.options.map((type) => (
                <SelectItem key={type} value={type}>
                  {TICKET_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ListToolbar>

        {isPending ? (
          <div aria-label="Đang tải yêu cầu" className="space-y-2 p-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : error ? (
          <p className="m-4 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {getErrorMessage(error)}
          </p>
        ) : tickets.length === 0 ? (
          <SearchEmpty
            description={
              isFiltered
                ? "Thử đổi hoặc đặt lại bộ lọc."
                : "Chưa có người dùng nào báo cáo câu trả lời."
            }
            title="Không có yêu cầu hỗ trợ nào"
          />
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable
                columns={columns}
                data={tickets}
                getRowId={(ticket) => ticket.id}
              />
            </div>
            <div className="grid gap-3 p-3 md:hidden">
              {tickets.map((ticket) => (
                <article className="rounded-xl border p-4" key={ticket.id}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 font-semibold break-words">
                      {ticket.title}
                    </p>
                    <TicketStatusBadge status={ticket.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ticket.userName || "—"} · {TICKET_TYPE_LABELS[ticket.type]}{" "}
                    · {formatAuditDate(ticket.createdAt)}
                  </p>
                  <Button
                    className="mt-3"
                    onClick={() => setOpenTicketId(ticket.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Eye aria-hidden="true" />
                    Xem chi tiết
                  </Button>
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

      {openTicketId ? (
        <AdminTicketDialog
          canUpdate={canUpdate}
          onClose={() => setOpenTicketId(undefined)}
          ticketId={openTicketId}
        />
      ) : null}
    </div>
  )
}
