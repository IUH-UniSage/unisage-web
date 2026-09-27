import { AlertTriangle, Check, CheckCircle2, Copy, XCircle } from "lucide-react"
import { useState } from "react"

import { AuditInfo } from "@/components/shared/audit-info"
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
import {
  getSourceTypeLabel,
  getVerificationStatusDisplayLabel,
  parseVerificationErrorMessage,
} from "@/features/chat-models/utils/chat-model-formatters"
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
  const [showRawError, setShowRawError] = useState(false)
  const [copiedRawError, setCopiedRawError] = useState(false)

  if (!chatModel) return null

  const parsedError = parseVerificationErrorMessage(
    chatModel.latestVerification?.errorMessage
  )

  const handleCopyRawError = () => {
    if (chatModel.latestVerification?.errorMessage) {
      navigator.clipboard.writeText(chatModel.latestVerification.errorMessage)
      setCopiedRawError(true)
      setTimeout(() => setCopiedRawError(false), 2000)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="truncate text-lg">
              {chatModel.displayName || chatModel.llmModelName}
            </DialogTitle>
            <EntityStatusBadge isActive={chatModel.isActive} />
          </div>
          <DialogDescription className="mt-0.5 flex flex-wrap items-center gap-2">
            {chatModel.displayName ? (
              <span className="text-xs text-muted-foreground">
                {chatModel.llmModelName}
              </span>
            ) : null}
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

          {chatModel.latestVerification ? (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Xác minh gần nhất
                </span>
                <div className="flex items-center gap-1.5">
                  {parsedError.statusCode ? (
                    <Badge
                      className="h-5 font-mono text-[10px] font-bold"
                      variant="destructive"
                    >
                      HTTP {parsedError.statusCode}
                    </Badge>
                  ) : null}
                  {chatModel.latestVerification.errorType ? (
                    <Badge className="h-5 text-[10px]" variant="outline">
                      {chatModel.latestVerification.errorType}
                    </Badge>
                  ) : null}
                  <span className="text-xs font-medium text-foreground">
                    {getVerificationStatusDisplayLabel(
                      chatModel.latestVerification
                    )}
                  </span>
                </div>
              </div>

              {chatModel.latestVerification.errorMessage ? (
                <div className="mt-2 space-y-2">
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs dark:bg-destructive/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-destructive"
                      />
                      <div className="min-w-0 space-y-1">
                        <p className="font-semibold text-destructive">
                          Nội dung lỗi:
                        </p>
                        <p className="dark:text-destructive-foreground/90 font-sans leading-relaxed wrap-break-word whitespace-pre-wrap text-destructive/90">
                          {parsedError.cleanMessage}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      className="cursor-pointer text-[11px] font-medium text-muted-foreground underline hover:text-foreground"
                      onClick={() => setShowRawError(!showRawError)}
                      type="button"
                    >
                      {showRawError
                        ? "Ẩn log kỹ thuật đầy đủ"
                        : "Xem log kỹ thuật đầy đủ (Raw Trace)"}
                    </button>

                    {showRawError ? (
                      <Button
                        className="h-6 cursor-pointer gap-1 text-[11px]"
                        onClick={handleCopyRawError}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        {copiedRawError ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        {copiedRawError ? "Đã sao chép" : "Sao chép log"}
                      </Button>
                    ) : null}
                  </div>

                  {showRawError ? (
                    <pre className="max-h-48 overflow-auto rounded-md border bg-muted/60 p-2.5 font-mono text-[11px] wrap-break-word whitespace-pre-wrap text-muted-foreground">
                      {chatModel.latestVerification.errorMessage}
                    </pre>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <AuditInfo
            createdAt={chatModel.createdAt}
            createdByName={chatModel.createdByName}
            updatedAt={chatModel.updatedAt}
            updatedByName={chatModel.updatedByName}
          />
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
