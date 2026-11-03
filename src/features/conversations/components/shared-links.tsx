import type { ColumnDef } from "@tanstack/react-table"
import { Copy, Link2, Link2Off, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { ConfirmDeleteDialog } from "@/components/shared/dialog/confirm-delete-dialog"
import { DataTable } from "@/components/shared/list/data-table"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { chatConversationPath } from "@/constants/paths"
import {
  useRevokeAllSharesMutation,
  useRevokeShareMutation,
} from "@/features/conversations/queries/use-mutations"
import { useMySharesQuery } from "@/features/conversations/queries/use-queries"
import type { Share } from "@/features/conversations/schemas/share-schemas"
import { copyShareLink } from "@/features/conversations/utils/share-link"
import { formatAuditDate } from "@/utils/date-format"

const PAGE_SIZE = 10

type PendingRevoke = { kind: "all" } | { kind: "one"; share: Share }

/** "Liên kết đã chia sẻ" (UNISAGE-107 R9): my active links, revoke one or all. */
export function SharedLinks() {
  const [page, setPage] = useState(1)
  const [pendingRevoke, setPendingRevoke] = useState<PendingRevoke | null>(null)
  const { data, isError, isPending, refetch } = useMySharesQuery({
    limit: PAGE_SIZE,
    page,
  })
  const revokeShare = useRevokeShareMutation()
  const revokeAll = useRevokeAllSharesMutation()
  const shares = data?.data ?? []

  const confirmRevoke = async () => {
    if (!pendingRevoke) return
    try {
      if (pendingRevoke.kind === "all") {
        await revokeAll.mutateAsync()
        setPage(1)
      } else {
        await revokeShare.mutateAsync(pendingRevoke.share.id)
        // The last row of a page is gone: step back instead of an empty page.
        if (shares.length === 1 && page > 1) setPage(page - 1)
      }
      setPendingRevoke(null)
    } catch {
      // Toasted by the mutation; keep the dialog open to retry.
    }
  }

  const columns: ColumnDef<Share, unknown>[] = [
    {
      accessorKey: "title",
      cell: ({ row }) => (
        <Link
          className="line-clamp-2 font-medium break-words text-foreground hover:text-primary hover:underline"
          title="Mở hội thoại gốc"
          to={chatConversationPath(row.original.conversationId)}
        >
          {row.original.title || "Đoạn chat không có tiêu đề"}
        </Link>
      ),
      header: "Tên hội thoại",
      meta: { className: "max-w-[16rem] whitespace-normal sm:max-w-md" },
    },
    {
      accessorKey: "createdAt",
      cell: ({ row }) => formatAuditDate(row.original.createdAt),
      header: "Ngày tạo",
      meta: {
        className: "hidden whitespace-nowrap sm:table-cell",
        headerClassName: "hidden sm:table-cell",
      },
    },
    {
      accessorKey: "messageCount",
      cell: ({ row }) => row.original.messageCount,
      header: "Số tin nhắn",
      meta: {
        className: "hidden text-right tabular-nums md:table-cell",
        headerClassName: "hidden text-right md:table-cell",
      },
    },
    {
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            aria-label={`Sao chép liên kết ${row.original.title ?? ""}`.trim()}
            onClick={() => void copyShareLink(row.original.token)}
            size="icon"
            title="Sao chép liên kết"
            variant="ghost"
          >
            <Copy aria-hidden="true" />
          </Button>
          <Button
            aria-label={`Thu hồi liên kết ${row.original.title ?? ""}`.trim()}
            className="text-destructive hover:text-destructive"
            onClick={() =>
              setPendingRevoke({ kind: "one", share: row.original })
            }
            size="icon"
            title="Thu hồi liên kết"
            variant="ghost"
          >
            <Link2Off aria-hidden="true" />
          </Button>
        </div>
      ),
      header: () => <span className="sr-only">Thao tác</span>,
      id: "actions",
      meta: { className: "w-24 text-right" },
    },
  ]

  return (
    <div className="mx-auto mt-6 mb-8 w-full max-w-[1200px] animate-in space-y-6 px-4 duration-300 fade-in">
      <div className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-primary to-primary/75 p-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-white/15 text-white sm:size-14">
            <Link2 aria-hidden="true" className="size-6 sm:size-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white/80">Trợ lý UniSage</p>
            <h1 className="text-xl font-bold text-white sm:truncate sm:text-2xl">
              Liên kết đã chia sẻ
            </h1>
            <p className="text-sm text-white/80">
              {data ? `${data.totalItems} liên kết` : "Đang tải..."}
            </p>
          </div>
        </div>
      </div>

      <Card className="border bg-card shadow-none">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-base font-semibold">
              Danh sách liên kết
            </CardTitle>
            <CardDescription>
              Ai có liên kết và đã đăng nhập đều xem được. Thu hồi để chặn xem
              qua liên kết; bản sao người khác đã tạo không bị ảnh hưởng.
            </CardDescription>
          </div>
          <Button
            className="w-full sm:w-auto"
            disabled={!data?.totalItems}
            onClick={() => setPendingRevoke({ kind: "all" })}
            variant="outline"
          >
            <Trash2 aria-hidden="true" />
            Thu hồi tất cả
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPending ? (
            <div aria-label="Đang tải liên kết" className="space-y-3">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Không thực hiện được, vui lòng thử lại sau.
              </p>
              <Button onClick={() => void refetch()} variant="outline">
                Thử lại
              </Button>
            </div>
          ) : shares.length === 0 ? (
            <SearchEmpty
              description="Mở một đoạn chat, bấm “Chia sẻ” để tạo liên kết gửi cho người khác."
              title="Bạn chưa chia sẻ liên kết nào"
            />
          ) : (
            <DataTable
              columns={columns}
              data={shares}
              getRowId={(share) => share.id}
            />
          )}

          {data && data.totalItems > 0 ? (
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

      {pendingRevoke ? (
        <ConfirmDeleteDialog
          confirmLabel={
            pendingRevoke.kind === "all" ? "Thu hồi tất cả" : "Thu hồi"
          }
          description={
            pendingRevoke.kind === "all"
              ? "Mọi liên kết bạn đã chia sẻ sẽ không mở được nữa. Bản sao người khác đã tạo vẫn giữ nguyên."
              : `Liên kết của “${pendingRevoke.share.title || "Đoạn chat không có tiêu đề"}” sẽ không mở được nữa. Bản sao người khác đã tạo vẫn giữ nguyên.`
          }
          entityLabel="liên kết"
          isSubmitting={revokeShare.isPending || revokeAll.isPending}
          onConfirm={confirmRevoke}
          onOpenChange={(open) => {
            if (!open) setPendingRevoke(null)
          }}
          submittingLabel="Đang thu hồi..."
          title={
            pendingRevoke.kind === "all"
              ? "Thu hồi tất cả liên kết?"
              : "Thu hồi liên kết?"
          }
        />
      ) : null}
    </div>
  )
}
