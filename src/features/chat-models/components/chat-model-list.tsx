import {
  Bot,
  Check,
  Cloud,
  Copy,
  Cpu,
  Gauge,
  Globe,
  KeyRound,
  Server,
  Sparkles,
  Zap,
} from "lucide-react"
import { useState } from "react"

import { EntityActionsMenu } from "@/components/shared/list/entity-actions-menu"
import { EntityStatusBadge } from "@/components/shared/list/entity-status-badge"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CHAT_MODEL_PAGE_SIZE } from "@/features/chat-models/hooks/use-chat-model-dashboard"
import type { ChatModel } from "@/features/chat-models/schemas/chat-model-schemas"
import { getSourceTypeLabel } from "@/features/chat-models/utils/chat-model-formatters"
import { cn } from "@/lib/utils"
import { formatAuditDate } from "@/utils/date-format"

type ChatModelListProps = {
  canDelete: boolean
  canRecover: boolean
  canUpdate: boolean
  chatModels: ChatModel[]
  currentPage: number
  onDetail: (chatModel: ChatModel) => void
  onEdit: (chatModel: ChatModel) => void
  onPageChange: (page: number) => void
  onStatusRequest: (chatModel: ChatModel) => void
  totalItems: number
  totalPages: number
}

function getProviderVisuals(
  provider: string | null,
  modelName: string,
  sourceType: string
) {
  const p = (provider || "").toLowerCase()
  const m = modelName.toLowerCase()

  if (p.includes("openai") || m.includes("gpt")) {
    return {
      avatarBg:
        "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
      icon: Sparkles,
      label: provider || "OpenAI",
    }
  }

  if (p.includes("google") || m.includes("gemini")) {
    return {
      avatarBg:
        "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20",
      icon: Zap,
      label: provider || "Google",
    }
  }

  if (p.includes("anthropic") || m.includes("claude")) {
    return {
      avatarBg:
        "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
      icon: Cpu,
      label: provider || "Anthropic",
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
    }
  }

  return {
    avatarBg: "bg-primary/10 text-primary border-primary/20",
    icon: Bot,
    label: provider || "AI Provider",
  }
}

export function ChatModelList({
  canDelete,
  canRecover,
  canUpdate,
  chatModels,
  currentPage,
  onDetail,
  onEdit,
  onPageChange,
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
              key={chatModel.id}
              onDetail={onDetail}
              onEdit={onEdit}
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
  onDetail,
  onEdit,
  onStatusRequest,
}: {
  canDelete: boolean
  canRecover: boolean
  canUpdate: boolean
  chatModel: ChatModel
  onDetail: (chatModel: ChatModel) => void
  onEdit: (chatModel: ChatModel) => void
  onStatusRequest: (chatModel: ChatModel) => void
}) {
  const [copied, setCopied] = useState(false)
  const visuals = getProviderVisuals(
    chatModel.llmProvider,
    chatModel.llmModelName,
    chatModel.sourceType
  )
  const ProviderIcon = visuals.icon

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
                "flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-xs transition-transform group-hover:scale-105",
                visuals.avatarBg
              )}
            >
              <ProviderIcon aria-hidden="true" className="size-5" />
            </div>

            <div className="min-w-0">
              <h3
                className="truncate text-base font-bold text-foreground transition-colors group-hover:text-primary"
                title={chatModel.llmModelName}
              >
                {chatModel.llmModelName}
              </h3>
              <p className="truncate text-xs text-muted-foreground">
                {visuals.label}
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

        {/* Badges: Status + Source Type + Priority */}
        <div className="flex flex-wrap items-center gap-1.5">
          <EntityStatusBadge isActive={chatModel.isActive} />

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
        </div>

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
