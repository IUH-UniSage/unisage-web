import {
  Activity,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  XCircle,
} from "lucide-react"
import type { ReactNode } from "react"

import { AuditInfo } from "@/components/shared/audit-info"
import { CopyableId } from "@/components/shared/copyable-id"
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
import {
  TOUR_ANCHORS,
  tourAnchor,
  type TourAnchor,
} from "@/constants/tour-anchors"
import { FailureMessagePanel } from "@/features/chat-models/components/failure-message-panel"
import type { ChatModel } from "@/features/chat-models/schemas/chat-model-schemas"
import {
  getPurposeLabel,
  getSourceTypeLabel,
  getStatusLabel,
  getVerificationStatusDisplayLabel,
  STATUS_BADGE_STYLES,
} from "@/features/chat-models/utils/chat-model-formatters"
import { DialogTourButton } from "@/features/product-tour"
import { cn } from "@/lib/utils"
import { formatDateTime, formatRelativeTime } from "@/utils/date"

type ChatModelDetailDialogProps = {
  canUpdate: boolean
  chatModel?: ChatModel
  onEdit: (chatModel: ChatModel) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

function DetailSection({
  anchor,
  children,
  icon: Icon,
  title,
}: {
  anchor?: TourAnchor
  children: ReactNode
  icon?: typeof SlidersHorizontal
  title: string
}) {
  return (
    <section
      className="space-y-4 rounded-xl border bg-muted/20 p-4 dark:bg-muted/10"
      data-tour={anchor}
    >
      <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {Icon ? (
          <Icon aria-hidden="true" className="size-3.5 text-primary" />
        ) : null}
        {title}
      </h3>
      {children}
    </section>
  )
}

function DetailField({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label: string
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold wrap-break-word text-foreground">
        {children}
      </dd>
    </div>
  )
}

function DateWithRelative({ value }: { value?: string | null }) {
  if (!value)
    return <span className="font-normal text-muted-foreground">—</span>

  return (
    <span>
      {formatDateTime(value)}
      <span className="ml-1 text-xs font-normal text-muted-foreground">
        ({formatRelativeTime(value)})
      </span>
    </span>
  )
}

export function ChatModelDetailDialog({
  canUpdate,
  chatModel,
  onEdit,
  onOpenChange,
  open,
}: ChatModelDetailDialogProps) {
  if (!chatModel) return null

  const verification = chatModel.latestVerification
  const hasRecentError =
    chatModel.errorCount > 0 ||
    Boolean(chatModel.lastErrorAt || chatModel.lastErrorMessage)

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogTourButton tourKey="chat-model-detail" />
        <DialogHeader
          {...tourAnchor(TOUR_ANCHORS.dialogHeader)}
          className="space-y-2 border-b pb-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <DialogTitle className="min-w-0 truncate text-xl font-bold">
              {chatModel.displayName || chatModel.llmModelName}
            </DialogTitle>
            <div className="flex shrink-0 items-center gap-2">
              <Badge
                className={STATUS_BADGE_STYLES[chatModel.status]}
                variant="outline"
              >
                {getStatusLabel(chatModel.status)}
              </Badge>
              <EntityStatusBadge isActive={chatModel.isActive} />
            </div>
          </div>
          <DialogDescription className="flex flex-wrap items-center gap-2 text-xs">
            {chatModel.displayName ? (
              <span className="font-mono text-muted-foreground">
                {chatModel.llmModelName}
              </span>
            ) : null}
            <Badge variant="secondary" className="text-[11px] font-normal">
              {getPurposeLabel(chatModel.modelPurpose)}
            </Badge>
            <Badge variant="outline" className="text-[11px] font-normal">
              {getSourceTypeLabel(chatModel.sourceType)}
            </Badge>
            {chatModel.llmProvider ? (
              <Badge variant="outline" className="text-[11px] font-normal">
                {chatModel.llmProvider}
              </Badge>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <DetailSection
            anchor={TOUR_ANCHORS.chatModelDetailConfig}
            icon={SlidersHorizontal}
            title="Cấu hình mô hình"
          >
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="Tên gợi nhớ">
                {chatModel.displayName || (
                  <span className="font-normal text-muted-foreground">
                    Chưa đặt
                  </span>
                )}
              </DetailField>
              <DetailField label="Tên mô hình">
                <span className="font-mono text-xs">
                  {chatModel.llmModelName}
                </span>
              </DetailField>
              <DetailField label="Nhà cung cấp">
                {chatModel.llmProvider || (
                  <span className="font-normal text-muted-foreground">—</span>
                )}
              </DetailField>
              <DetailField label="Mục đích">
                {getPurposeLabel(chatModel.modelPurpose)}
              </DetailField>
              <DetailField label="API key">
                {chatModel.hasApiKey ? (
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 aria-hidden="true" className="size-3.5" />
                    Đã cấu hình
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-normal text-muted-foreground">
                    <XCircle aria-hidden="true" className="size-3.5" />
                    Chưa cấu hình
                  </span>
                )}
              </DetailField>
              <DetailField label="ID mô hình">
                <CopyableId value={chatModel.id} />
              </DetailField>
              <DetailField
                className="sm:col-span-2 lg:col-span-3"
                label="API Base URL"
              >
                <span className="font-mono text-xs break-all">
                  {chatModel.apiBaseUrl}
                </span>
              </DetailField>
              {chatModel.sourceType === "SELF_HOSTED" &&
              chatModel.modelSourceRef ? (
                <DetailField
                  className="sm:col-span-2 lg:col-span-3"
                  label="Tham chiếu nguồn"
                >
                  {chatModel.modelSourceRef}
                </DetailField>
              ) : null}
              <DetailField label="Giới hạn RPM">
                {chatModel.maxRpm != null ? (
                  `${chatModel.maxRpm} lượt/phút`
                ) : (
                  <span className="font-normal text-muted-foreground">
                    Không giới hạn
                  </span>
                )}
              </DetailField>
              <DetailField label="Giới hạn đồng thời">
                {chatModel.maxConcurrency != null ? (
                  `${chatModel.maxConcurrency} yêu cầu`
                ) : (
                  <span className="font-normal text-muted-foreground">
                    Không giới hạn
                  </span>
                )}
              </DetailField>
              <DetailField label="Độ ưu tiên">
                {chatModel.priority ?? (
                  <span className="font-normal text-muted-foreground">
                    Không đặt
                  </span>
                )}
              </DetailField>
              <DetailField label="Revision">
                {chatModel.revision ?? "—"}
              </DetailField>
              <DetailField label="Xác minh thành công lúc">
                <DateWithRelative value={chatModel.verifiedAt} />
              </DetailField>
              <DetailField label="Thay đổi chờ xác minh">
                {chatModel.hasPendingChange ? "Có" : "Không"}
              </DetailField>
            </dl>
          </DetailSection>

          <DetailSection
            anchor={TOUR_ANCHORS.chatModelDetailErrors}
            icon={ShieldAlert}
            title="Lỗi gần đây khi gọi mô hình"
          >
            {hasRecentError ? (
              <div className="space-y-4">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                  <DetailField label="Tổng số lỗi đã ghi nhận">
                    {chatModel.errorCount}
                  </DetailField>
                  <DetailField label="Lần gần nhất">
                    <DateWithRelative value={chatModel.lastErrorAt} />
                  </DetailField>
                  <DetailField label="Mã lỗi">
                    {chatModel.lastErrorCode ? (
                      <span className="font-mono text-xs">
                        {chatModel.lastErrorCode}
                      </span>
                    ) : (
                      <span className="font-normal text-muted-foreground">
                        —
                      </span>
                    )}
                  </DetailField>
                </dl>
                {chatModel.lastErrorMessage ? (
                  <FailureMessagePanel message={chatModel.lastErrorMessage} />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Không có nội dung chi tiết cho lỗi này.
                  </p>
                )}
              </div>
            ) : (
              <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <ShieldCheck
                  aria-hidden="true"
                  className="size-4 text-success"
                />
                Chưa ghi nhận lỗi nào khi gọi mô hình.
              </p>
            )}
          </DetailSection>

          {verification ? (
            <DetailSection
              anchor={TOUR_ANCHORS.chatModelDetailVerification}
              icon={Activity}
              title="Xác minh gần nhất"
            >
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                <DetailField label="Trạng thái">
                  {getVerificationStatusDisplayLabel(verification)}
                </DetailField>
                <DetailField label="Lần thử">
                  {verification.attempt ?? "—"}
                </DetailField>
                <DetailField label="Loại lỗi">
                  {verification.errorType ? (
                    <span className="font-mono text-xs">
                      {verification.errorType}
                    </span>
                  ) : (
                    <span className="font-normal text-muted-foreground">—</span>
                  )}
                </DetailField>
                <DetailField label="Tạo lúc">
                  <DateWithRelative value={verification.createdAt} />
                </DetailField>
                <DetailField label="Kết thúc lúc">
                  <DateWithRelative value={verification.finishedAt} />
                </DetailField>
                <DetailField label="Mã lỗi">
                  {verification.errorCode ? (
                    <span className="font-mono text-xs">
                      {verification.errorCode}
                    </span>
                  ) : (
                    <span className="font-normal text-muted-foreground">—</span>
                  )}
                </DetailField>
              </dl>
              <FailureMessagePanel message={verification.errorMessage} />
            </DetailSection>
          ) : null}

          <AuditInfo
            createdAt={chatModel.createdAt}
            createdByName={chatModel.createdByName}
            updatedAt={chatModel.updatedAt}
            updatedByName={chatModel.updatedByName}
          />
        </div>

        <DialogFooter
          {...tourAnchor(TOUR_ANCHORS.dialogFooter)}
          className="gap-2 pt-2 sm:gap-2"
        >
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
