import { Plus } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { RefreshButton } from "@/components/shared/refresh-button"
import { ListToolbar } from "@/components/shared/list/list-toolbar"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatModelDetailDialog } from "@/features/chat-models/components/chat-model-detail-dialog"
import { ChatModelDialog } from "@/features/chat-models/components/chat-model-dialog"
import { ChatModelList } from "@/features/chat-models/components/chat-model-list"
import { ChatModelStatusDialog } from "@/features/chat-models/components/chat-model-status-dialog"
import { VerificationJobList } from "@/features/chat-models/components/verification-job-list"
import { chatModelKeys } from "@/features/chat-models/queries/keys"
import { useChatModelDashboard } from "@/features/chat-models/hooks/use-chat-model-dashboard"
import type {
  ActiveFilter,
  ModelStatusFilter,
  PrioritySort,
  PurposeFilter,
} from "@/features/chat-models/hooks/use-chat-model-dashboard"
import {
  chatModelPurposeSchema,
  chatModelStatusSchema,
} from "@/features/chat-models/schemas/chat-model-schemas"
import {
  getPurposeLabel,
  getStatusLabel,
} from "@/features/chat-models/utils/chat-model-formatters"

const ALL = "ALL"

const CHAT_MODEL_TABS = ["models", "jobs"] as const
type ChatModelTab = (typeof CHAT_MODEL_TABS)[number]

function isChatModelTab(value: string | null): value is ChatModelTab {
  return (CHAT_MODEL_TABS as readonly string[]).includes(value ?? "")
}

export function ChatModelDashboard() {
  const dashboard = useChatModelDashboard()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab: ChatModelTab = isChatModelTab(searchParams.get("tab"))
    ? (searchParams.get("tab") as ChatModelTab)
    : "models"

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

        <Tabs
          onValueChange={(value) => {
            setSearchParams(
              (previous) => {
                const next = new URLSearchParams(previous)
                if (value === "models") {
                  next.delete("tab")
                } else {
                  next.set("tab", value)
                }
                return next
              },
              { replace: true }
            )
          }}
          value={activeTab}
        >
          <TabsList>
            <TabsTrigger value="models">Mô hình</TabsTrigger>
            <TabsTrigger value="jobs">Jobs xác minh</TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-5" value="models">
            <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
              <ListToolbar
                isFiltered={dashboard.isFiltered}
                onApplyFilters={dashboard.applyFilters}
                onResetFilters={dashboard.resetFilters}
                onSearchChange={dashboard.setSearch}
                search={dashboard.search}
                searchAriaLabel="Tìm kiếm mô hình chat"
                searchPlaceholder="Tìm theo tên mô hình, nhà cung cấp hoặc URL..."
              >
                <Select
                  onValueChange={(value) =>
                    dashboard.setActiveFilter(value as ActiveFilter)
                  }
                  value={dashboard.activeFilter}
                >
                  <SelectTrigger
                    aria-label="Lọc theo trạng thái hoạt động"
                    className="w-44"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Đang sử dụng</SelectItem>
                    <SelectItem value="INACTIVE">Đã vô hiệu hoá</SelectItem>
                    <SelectItem value={ALL}>Tất cả</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) =>
                    dashboard.setPurposeFilter(value as PurposeFilter)
                  }
                  value={dashboard.purposeFilter}
                >
                  <SelectTrigger
                    aria-label="Lọc theo mục đích sử dụng"
                    className="w-44"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Mọi mục đích</SelectItem>
                    {chatModelPurposeSchema.options.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>
                        {getPurposeLabel(purpose)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) =>
                    dashboard.setModelStatusFilter(value as ModelStatusFilter)
                  }
                  value={dashboard.modelStatusFilter}
                >
                  <SelectTrigger
                    aria-label="Lọc theo trạng thái"
                    className="w-44"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Mọi trạng thái</SelectItem>
                    {chatModelStatusSchema.options.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) =>
                    dashboard.setPrioritySort(value as PrioritySort)
                  }
                  value={dashboard.prioritySort}
                >
                  <SelectTrigger
                    aria-label="Sắp xếp theo độ ưu tiên"
                    className="w-52"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* priority=0 is the highest priority, so ascending order
                        (0, 1, 2, ...) reads as "cao đến thấp", not the other
                        way around. */}
                    <SelectItem value="asc">Ưu tiên: Cao đến thấp</SelectItem>
                    <SelectItem value="desc">Ưu tiên: Thấp đến cao</SelectItem>
                  </SelectContent>
                </Select>

                <RefreshButton
                  label="Làm mới danh sách mô hình"
                  queryKeys={[chatModelKeys.all]}
                />
              </ListToolbar>
            </div>

            {/* Card Grid List */}
            {dashboard.isPending ? (
              <div
                aria-label="Đang tải danh sách mô hình chat"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton className="h-60 rounded-2xl" key={i} />
                ))}
              </div>
            ) : (
              <ChatModelList
                canDelete={dashboard.canDelete}
                canRecover={dashboard.canRecover}
                canUpdate={dashboard.canUpdate}
                chatModels={dashboard.chatModels}
                currentPage={dashboard.page}
                isUpdatingStatus={dashboard.isUpdatingChatModelStatus}
                isVerifying={dashboard.isVerifying}
                onActivate={dashboard.activateChatModel}
                onDeactivate={dashboard.deactivateChatModel}
                onDetail={dashboard.openChatModelDetail}
                onEdit={dashboard.openEdit}
                onPageChange={dashboard.setPage}
                onReverify={dashboard.reverifyChatModel}
                onStatusRequest={dashboard.requestStatusChange}
                totalItems={dashboard.totalItems}
                totalPages={dashboard.totalPages}
              />
            )}
          </TabsContent>

          <TabsContent value="jobs">
            <VerificationJobList />
          </TabsContent>
        </Tabs>
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
