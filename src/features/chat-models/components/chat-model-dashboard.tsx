import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatModelDetailDialog } from "@/features/chat-models/components/chat-model-detail-dialog"
import { ChatModelDialog } from "@/features/chat-models/components/chat-model-dialog"
import { ChatModelList } from "@/features/chat-models/components/chat-model-list"
import { ChatModelStatusDialog } from "@/features/chat-models/components/chat-model-status-dialog"
import { useChatModelDashboard } from "@/features/chat-models/hooks/use-chat-model-dashboard"

export function ChatModelDashboard() {
  const dashboard = useChatModelDashboard()

  if (dashboard.isPending) {
    return <ChatModelSkeleton />
  }

  return (
    <>
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
              Quản trị · Cấu hình AI
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              Mô hình chat
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Quản lý các mô hình ngôn ngữ dùng cho tính năng trò chuyện với
              UniSage.
            </p>
          </div>

          {dashboard.canCreate ? (
            <Button
              className="cursor-pointer gap-2 shadow-xs sm:self-end"
              onClick={dashboard.openCreate}
            >
              <Plus aria-hidden="true" className="size-4" />
              Thêm mô hình chat
            </Button>
          ) : null}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Tìm kiếm mô hình chat"
            className="h-10 rounded-xl pl-9.5 text-sm"
            onChange={(e) => dashboard.setSearch(e.target.value)}
            placeholder="Tìm theo tên mô hình, nhà cung cấp hoặc URL..."
            value={dashboard.search}
          />
        </div>

        {/* Card Grid List */}
        <ChatModelList
          canDelete={dashboard.canDelete}
          canRecover={dashboard.canRecover}
          canUpdate={dashboard.canUpdate}
          chatModels={dashboard.chatModels}
          currentPage={dashboard.page}
          onDetail={dashboard.openChatModelDetail}
          onEdit={dashboard.openEdit}
          onPageChange={dashboard.setPage}
          onStatusRequest={dashboard.requestStatusChange}
          totalItems={dashboard.totalItems}
          totalPages={dashboard.totalPages}
        />
      </div>

      {dashboard.viewingChatModel ? (
        <ChatModelDetailDialog
          canUpdate={dashboard.canUpdate}
          chatModel={dashboard.viewingChatModel}
          onEdit={dashboard.openEdit}
          onOpenChange={(open) => {
            if (!open) dashboard.closeChatModelDetail()
          }}
          open
        />
      ) : null}

      {dashboard.isDialogOpen ? (
        <ChatModelDialog
          chatModel={dashboard.editingChatModel}
          isSaving={dashboard.isSaving}
          onOpenChange={(open) => {
            if (!open) dashboard.closeDialog()
          }}
          onSubmit={dashboard.save}
          open
        />
      ) : null}

      {dashboard.statusChatModel ? (
        <ChatModelStatusDialog
          chatModel={dashboard.statusChatModel}
          isSubmitting={dashboard.isUpdatingStatus}
          onConfirm={dashboard.confirmStatusChange}
          onOpenChange={(open) => {
            if (!open) dashboard.closeStatusDialog()
          }}
        />
      ) : null}
    </>
  )
}

function ChatModelSkeleton() {
  return (
    <div aria-label="Đang tải danh sách mô hình chat" className="space-y-5">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-[520px] max-w-full" />
      </div>

      <Skeleton className="h-10 w-80 rounded-xl" />

      <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton className="h-60 rounded-2xl" key={i} />
        ))}
      </div>
    </div>
  )
}
