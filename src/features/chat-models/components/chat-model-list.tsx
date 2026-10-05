import {
  AlertTriangle,
  Bot,
  Check,
  ChevronRight,
  Cloud,
  Copy,
  Cpu,
  Gauge,
  Globe,
  KeyRound,
  Power,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react"
import { useState } from "react"

import { EntityActionsMenu } from "@/components/shared/list/entity-actions-menu"
import { EntityStatusBadge } from "@/components/shared/list/entity-status-badge"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CHAT_MODEL_PAGE_SIZE } from "@/features/chat-models/hooks/use-chat-model-dashboard"
import type { ChatModel } from "@/features/chat-models/schemas/chat-model-schemas"
import {
  getActivateBlockedReason,
  getPurposeLabel,
  getStatusLabel,
  getVerificationStatusDisplayLabel,
  getSourceTypeLabel,
  parseVerificationErrorMessage,
  STATUS_BADGE_STYLES,
} from "@/features/chat-models/utils/chat-model-formatters"
import { cn } from "@/lib/utils"
import { formatAuditDate } from "@/utils/date-format"

type ChatModelListProps = {
  canDelete: boolean
  canRecover: boolean
  canUpdate: boolean
  chatModels: ChatModel[]
  currentPage: number
  isUpdatingStatus: boolean
  isVerifying: boolean
  onActivate: (chatModel: ChatModel) => Promise<unknown>
  onDeactivate: (chatModel: ChatModel) => Promise<unknown>
  onDetail: (chatModel: ChatModel) => void
  onEdit: (chatModel: ChatModel) => void
  onPageChange: (page: number) => void
  onReverify: (chatModel: ChatModel) => Promise<unknown>
  onStatusRequest: (chatModel: ChatModel) => void
  totalItems: number
  totalPages: number
}

// Mirrors CHAT_MODEL_PROVIDERS' `value`s (chat-model-providers.json) - one
// logo file per supported cloud provider, served from public/providers/.
// Providers without a file here (self-hosted, anthropic, unrecognized) fall
// back to a lucide icon below.
const PROVIDER_LOGOS: Record<string, string> = {
  google: "/providers/gemini.jpg",
  openai: "/providers/openai.png",
}

function getProviderVisuals(
  provider: string | null,
  modelName: string,
  sourceType: string
) {
  const p = (provider || "").toLowerCase()
  const m = modelName.toLowerCase()

  const logoSrc = PROVIDER_LOGOS[p]
  if (logoSrc) {
    return {
      avatarBg: "bg-muted/50 border-border/70",
      icon: null,
      label: provider || p,
      logoSrc,
    }
  }

  if (p.includes("anthropic") || m.includes("claude")) {
    return {
      avatarBg:
        "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
      icon: Cpu,
      label: provider || "Anthropic",
      logoSrc: undefined,
    }
  }

  if (
    sourceType === "SELF_HOSTED" ||
    p.includes("ollama") ||
    m.includes("llama")
  ) {
    return {
      avatarBg:
        "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20",
      icon: Server,
      label: provider || "Self-Hosted / Ollama",
      logoSrc: undefined,
    }
  }

  return {
    avatarBg: "bg-primary/10 text-primary border-primary/20",
    icon: Bot,
    label: provider || "AI Provider",
    logoSrc: undefined,
  }
}

export function ChatModelList({
  canDelete,
  canRecover,
  canUpdate,
  chatModels,
  currentPage,
  isUpdatingStatus,
  isVerifying,
  onActivate,
  onDeactivate,
  onDetail,
  onEdit,
  onPageChange,
  onReverify,
  onStatusRequest,
  totalItems,
  totalPages,
}: ChatModelListProps) {
  return (
    <div className="space-y-4">
      {chatModels.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chatModels.map((chatModel) => (
            <ChatModelCard
              canDelete={canDelete}
              canRecover={canRecover}
              canUpdate={canUpdate}
              chatModel={chatModel}
              isUpdatingStatus={isUpdatingStatus}
              isVerifying={isVerifying}
              key={chatModel.id}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
              onDetail={onDetail}
              onEdit={onEdit}
              onReverify={onReverify}
              onStatusRequest={onStatusRequest}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-xs">
          <SearchEmpty
            description="Không tìm thấy mô hình chat nào phù hợp với từ khóa tìm kiếm."
            title="Không có mô hình chat"
          />
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageSize={CHAT_MODEL_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  )
}

function ChatModelCard({
  canDelete,
  canRecover,
  canUpdate,
  chatModel,
  isUpdatingStatus,
  isVerifying,
  onActivate,
  onDeactivate,
  onDetail,
  onEdit,
  onReverify,
  onStatusRequest,
}: {
  canDelete: boolean
  canRecover: boolean
  canUpdate: boolean
  chatModel: ChatModel
  isUpdatingStatus: boolean
  isVerifying: boolean
  onActivate: (chatModel: ChatModel) => Promise<unknown>
  onDeactivate: (chatModel: ChatModel) => Promise<unknown>
  onDetail: (chatModel: ChatModel) => void
  onEdit: (chatModel: ChatModel) => void
  onReverify: (chatModel: ChatModel) => Promise<unknown>
  onStatusRequest: (chatModel: ChatModel) => void
}) {
  const [copied, setCopied] = useState(false)
  const visuals = getProviderVisuals(
    chatModel.llmProvider,
    chatModel.llmModelName,
    chatModel.sourceType
  )
  const ProviderIcon = visuals.icon
  const activateBlockedReason = getActivateBlockedReason(chatModel)

  const handleCopyEndpoint = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(chatModel.apiBaseUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const stopAnd =
    (action: (chatModel: ChatModel) => Promise<unknown>) =>
    (e: React.MouseEvent) => {
      e.stopPropagation()
      void action(chatModel)
    }

  const parsedError = parseVerificationErrorMessage(
    chatModel.latestVerification?.errorMessage
  )

  return (
    <article
      className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-4.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md dark:border-white/10 dark:bg-card"
      onClick={() => onDetail(chatModel)}
    >
      <div className="space-y-3.5">
        {/* Header: Icon + Title + Action Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-xs transition-transform group-hover:scale-105",
                visuals.avatarBg
              )}
            >
              {visuals.logoSrc ? (
                <img
                  alt={visuals.label}
                  className="size-full object-cover"
                  src={visuals.logoSrc}
                />
              ) : ProviderIcon ? (
                <ProviderIcon aria-hidden="true" className="size-5" />
              ) : null}
            </div>

            <div className="min-w-0">
              <h3
                className="truncate text-base font-bold text-foreground transition-colors group-hover:text-primary"
                title={chatModel.displayName || chatModel.llmModelName}
              >
                {chatModel.displayName || chatModel.llmModelName}
              </h3>
              <p className="truncate text-xs text-muted-foreground">
                {chatModel.displayName
                  ? `${chatModel.llmModelName} · ${visuals.label}`
                  : visuals.label}
              </p>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <EntityActionsMenu
              canDelete={chatModel.isActive ? canDelete : canRecover}
              canUpdate={canUpdate}
              entityLabel={`mô hình chat ${chatModel.llmModelName}`}
              isActive={chatModel.isActive}
              onDetail={() => onDetail(chatModel)}
              onEdit={() => onEdit(chatModel)}
              onStatusRequest={() => onStatusRequest(chatModel)}
            />
          </div>
        </div>

        {/* Badges: Soft-delete status + Registry status + Purpose + Source Type + Priority */}
        <div className="flex flex-wrap items-center gap-1.5">
          <EntityStatusBadge isActive={chatModel.isActive} />

          <Badge
            className={cn(
              "gap-1 font-medium",
              STATUS_BADGE_STYLES[chatModel.status]
            )}
            variant="outline"
          >
            <span>{getStatusLabel(chatModel.status)}</span>
          </Badge>

          <Badge
            className="font-normal text-muted-foreground"
            variant="outline"
          >
            {getPurposeLabel(chatModel.modelPurpose)}
          </Badge>

          <Badge
            className="gap-1 font-normal text-muted-foreground"
            variant="outline"
          >
            {chatModel.sourceType === "CLOUD_API" ? (
              <Cloud aria-hidden="true" className="size-3 text-sky-500" />
            ) : (
              <Server aria-hidden="true" className="size-3 text-purple-500" />
            )}
            <span>{getSourceTypeLabel(chatModel.sourceType)}</span>
          </Badge>

          {typeof chatModel.priority === "number" ? (
            <Badge
              className="gap-1 border-amber-500/30 bg-amber-500/10 font-medium text-amber-600 dark:text-amber-400"
              variant="outline"
            >
              <Zap aria-hidden="true" className="size-3" />
              <span>Ưu tiên #{chatModel.priority}</span>
            </Badge>
          ) : null}
        </div>

        {chatModel.hasPendingChange ? (
          <div className="flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-3.5 shrink-0"
            />
            <span>
              Thay đổi đang chờ xác minh — đang chạy bằng cấu hình cũ.
            </span>
          </div>
        ) : null}

        {chatModel.latestVerification?.status === "FAILED" ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs dark:bg-destructive/20">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-semibold text-destructive">
                <AlertTriangle
                  aria-hidden="true"
                  className="size-4 shrink-0 text-destructive"
                />
                <span>Thay đổi chưa được áp dụng</span>
              </div>
              {parsedError.statusCode ? (
                <span className="shrink-0 rounded-md bg-destructive/20 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-destructive">
                  HTTP {parsedError.statusCode}
                </span>
              ) : null}
            </div>

            {parsedError.cleanMessage ? (
              <p className="dark:text-destructive-foreground/90 line-clamp-3 text-[11.5px] leading-relaxed wrap-break-word text-destructive/90">
                {parsedError.cleanMessage}
              </p>
            ) : null}

            <div className="mt-2 flex items-center justify-between border-t border-destructive/20 pt-2 text-[11px]">
              <span className="dark:text-destructive-foreground/70 text-destructive/70">
                Lỗi xác minh mô hình
              </span>
              <button
                className="flex cursor-pointer items-center gap-0.5 font-medium text-destructive hover:underline"
                onClick={(e) => {
                  e.stopPropagation()
                  onDetail(chatModel)
                }}
                type="button"
              >
                <span>Xem chi tiết</span>
                <ChevronRight aria-hidden="true" className="size-3" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Technical Specs: RPM & API Key */}
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/50 bg-muted/30 p-2.5 text-xs dark:bg-muted/15">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Gauge
              aria-hidden="true"
              className="size-3.5 shrink-0 text-primary"
            />
            <span className="truncate">
              <strong className="font-semibold text-foreground">
                {chatModel.maxRpm}
              </strong>{" "}
              RPM
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <KeyRound
              aria-hidden="true"
              className="size-3.5 shrink-0 text-amber-500"
            />
            <span className="truncate">
              {chatModel.hasApiKey ? "Đã có API Key" : "Không dùng Key"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="truncate">
              Rev.{" "}
              <strong className="font-semibold text-foreground">
                {chatModel.revision ?? "—"}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="truncate">
              Xác minh: {formatAuditDate(chatModel.verifiedAt)}
            </span>
          </div>
        </div>

        {chatModel.latestVerification || chatModel.lastErrorCode ? (
          <div className="space-y-1 rounded-xl border border-border/50 bg-muted/30 p-2.5 text-xs dark:bg-muted/15">
            {chatModel.latestVerification ? (
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span>Xác minh gần nhất</span>
                <span className="font-medium text-foreground">
                  {getVerificationStatusDisplayLabel(
                    chatModel.latestVerification
                  )}
                </span>
              </div>
            ) : null}
            {chatModel.lastErrorCode ? (
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span>Lỗi gần nhất</span>
                <span className="truncate font-medium text-destructive">
                  {chatModel.lastErrorCode}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Endpoint URL Box */}
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-xs dark:bg-muted/20">
          <div className="flex min-w-0 items-center gap-2">
            <Globe
              aria-hidden="true"
              className="size-3.5 shrink-0 text-muted-foreground"
            />
            <span
              className="truncate font-mono text-[11.5px] text-muted-foreground"
              title={chatModel.apiBaseUrl}
            >
              {chatModel.apiBaseUrl}
            </span>
          </div>

          <button
            aria-label="Sao chép Endpoint URL"
            className="shrink-0 cursor-pointer p-1 text-muted-foreground transition-colors hover:text-foreground"
            onClick={handleCopyEndpoint}
            title="Sao chép Endpoint"
            type="button"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {canUpdate ? (
        <div className="mt-3 flex items-center gap-1.5 border-t border-border/40 pt-3">
          {chatModel.status === "INACTIVE" ||
          chatModel.status === "PENDING" ||
          chatModel.status === "DISABLED" ? (
            activateBlockedReason ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      className="h-7 cursor-not-allowed px-2.5 text-xs"
                      disabled
                      size="sm"
                      variant="outline"
                    >
                      <Power aria-hidden="true" className="size-3.5" />
                      Kích hoạt
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent onClick={(e) => e.stopPropagation()}>
                  {activateBlockedReason.message}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                className="h-7 cursor-pointer px-2.5 text-xs"
                disabled={isUpdatingStatus}
                onClick={stopAnd(onActivate)}
                size="sm"
                variant="outline"
              >
                <Power aria-hidden="true" className="size-3.5" />
                Kích hoạt
              </Button>
            )
          ) : null}

          {chatModel.status === "ACTIVE" ? (
            <Button
              className="h-7 cursor-pointer px-2.5 text-xs"
              disabled={isUpdatingStatus}
              onClick={stopAnd(onDeactivate)}
              size="sm"
              variant="outline"
            >
              <Power aria-hidden="true" className="size-3.5" />
              Tạm ngưng
            </Button>
          ) : null}

          <Button
            className="h-7 cursor-pointer px-2.5 text-xs"
            disabled={isVerifying}
            onClick={stopAnd(onReverify)}
            size="sm"
            variant="outline"
          >
            <RefreshCw aria-hidden="true" className="size-3.5" />
            Xác minh lại
          </Button>
        </div>
      ) : null}

      {/* Footer Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs">
        <span className="text-[11px] text-muted-foreground">
          {formatAuditDate(chatModel.createdAt)}
        </span>

        <div className="flex items-center gap-1.5">
          {canUpdate ? (
            <Button
              className="h-7 cursor-pointer px-2.5 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(chatModel)
              }}
              size="sm"
              variant="outline"
            >
              Chỉnh sửa
            </Button>
          ) : null}

          <Button
            className="h-7 cursor-pointer px-2.5 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onDetail(chatModel)
            }}
            size="sm"
            variant="ghost"
          >
            Chi tiết
          </Button>
        </div>
      </div>
    </article>
  )
}
