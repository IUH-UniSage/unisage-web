import { CheckCircle2, XCircle } from "lucide-react"

import { EntityStatusBadge } from "@/components/shared/list/entity-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ChatModel } from "@/features/chat-models/schemas/chat-model-schemas"
import { getSourceTypeLabel } from "@/features/chat-models/utils/chat-model-formatters"
import { formatAuditDate } from "@/utils/date-format"

type ChatModelDetailDialogProps = {
  canUpdate: boolean
  chatModel?: ChatModel
  onEdit: (chatModel: ChatModel) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function ChatModelDetailDialog({
  canUpdate,
  chatModel,
  onEdit,
  onOpenChange,
  open,
}: ChatModelDetailDialogProps) {
  if (!chatModel) return null

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="truncate text-lg">
              {chatModel.llmModelName}
            </DialogTitle>
            <EntityStatusBadge isActive={chatModel.isActive} />
          </div>
          <DialogDescription className="mt-0.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {getSourceTypeLabel(chatModel.sourceType)}
            </Badge>
            {chatModel.sourceType === "CLOUD_API" && chatModel.llmProvider ? (
              <span className="text-xs text-muted-foreground">
                {chatModel.llmProvider}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-muted-foreground">
                API Base URL
              </span>
              <span className="truncate text-xs">{chatModel.apiBaseUrl}</span>
            </div>
            {chatModel.sourceType === "SELF_HOSTED" &&
            chatModel.modelSourceRef ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-muted-foreground">
                  Tham chiếu nguồn
                </span>
                <span className="truncate text-xs">
                  {chatModel.modelSourceRef}
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-muted-foreground">
                API key
              </span>
              {chatModel.hasApiKey ? (
                <span className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 aria-hidden="true" className="size-3.5" />
                  Đã cấu hình
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <XCircle aria-hidden="true" className="size-3.5" />
                  Chưa cấu hình
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3.5 text-xs">
            <div>
              <span className="block text-muted-foreground">Giới hạn RPM</span>
              <span className="font-medium text-foreground">
                {chatModel.maxRpm}
              </span>
            </div>
            <div>
              <span className="block text-muted-foreground">Độ ưu tiên</span>
              <span className="font-medium text-foreground">
                {chatModel.priority ?? "Không đặt"}
              </span>
            </div>
            <div>
              <span className="block text-muted-foreground">Số lỗi</span>
              <span className="font-medium text-foreground">
                {chatModel.errorCount}
              </span>
            </div>
            <div>
              <span className="block text-muted-foreground">Lỗi gần nhất</span>
              <span className="font-medium text-foreground">
                {formatAuditDate(chatModel.lastErrorAt)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t pt-3 text-xs text-muted-foreground">
            <div>
              <span className="block text-[11px]">Người tạo</span>
              <span className="font-medium text-foreground">
                {chatModel.createdBy || "Hệ thống"}
              </span>
            </div>
            <div>
              <span className="block text-[11px]">Ngày tạo</span>
              <span className="font-medium text-foreground">
                {formatAuditDate(chatModel.createdAt)}
              </span>
            </div>
            {chatModel.updatedAt ? (
              <>
                <div>
                  <span className="block text-[11px]">Người cập nhật</span>
                  <span className="font-medium text-foreground">
                    {chatModel.updatedBy || "Hệ thống"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px]">Cập nhật lần cuối</span>
                  <span className="font-medium text-foreground">
                    {formatAuditDate(chatModel.updatedAt)}
                  </span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Đóng
            </Button>
          </DialogClose>
          {canUpdate ? (
            <Button
              onClick={() => {
                onOpenChange(false)
                onEdit(chatModel)
              }}
              type="button"
            >
              Chỉnh sửa
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
