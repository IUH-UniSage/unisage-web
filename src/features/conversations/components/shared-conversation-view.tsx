import {
  ArrowRight,
  Link2Off,
  Loader2,
  MessageSquareShare,
  RotateCw,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { chatConversationPath, ROUTES } from "@/constants/paths"
import { ReadOnlyConversation } from "@/features/chat/components/chat-conversation-content"
import { CitationDrawer } from "@/features/chat/components/citation-drawer"
import type { Citation } from "@/features/chat/schemas/chat-schemas"
import { webCitationUrl } from "@/features/chat/utils/citations"
import { useContinueShareMutation } from "@/features/conversations/queries/use-mutations"
import { useSharedConversationQuery } from "@/features/conversations/queries/use-queries"
import type { SharedConversation } from "@/features/conversations/schemas/share-schemas"
import {
  isShareNotFound,
  SHARE_NOT_FOUND_MESSAGE,
} from "@/features/conversations/utils/share-errors"
import { toReadOnlyMessage } from "@/features/conversations/utils/shared-messages"
import { formatDate } from "@/utils/date"

/** `/share/:token`: the read-only snapshot of a shared conversation (UNISAGE-107). */
export function SharedConversationView({ token }: { token: string }) {
  const query = useSharedConversationQuery(token)

  if (query.isPending) {
    return (
      <div
        aria-label="Đang tải hội thoại được chia sẻ"
        className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8"
      >
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="ml-auto h-12 w-2/3 rounded-3xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (query.isError) {
    return isShareNotFound(query.error) ? (
      <SharedConversationEmpty
        description="Người chia sẻ có thể đã thu hồi liên kết hoặc xoá đoạn chat này."
        title={SHARE_NOT_FOUND_MESSAGE}
      />
    ) : (
      <SharedConversationEmpty
        description="Không thực hiện được, vui lòng thử lại sau."
        onRetry={() => void query.refetch()}
        title="Chưa mở được hội thoại"
      />
    )
  }

  return <SharedConversationContent conversation={query.data} token={token} />
}

function SharedConversationContent({
  conversation,
  token,
}: {
  conversation: SharedConversation
  token: string
}) {
  const navigate = useNavigate()
  const continueShare = useContinueShareMutation()
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null)
  const messages = conversation.messages.map(toReadOnlyMessage)

  // Same as the chat page: a web source opens its page, a document opens the
  // drawer, which checks the viewer's own access (spec R6).
  const openCitation = (citation: Citation) => {
    const url = webCitationUrl(citation)
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
      return
    }
    setActiveCitation(citation)
  }

  const handleContinue = () => {
    continueShare.mutate(token, {
      onSuccess: ({ conversationId }) =>
        void navigate(chatConversationPath(conversationId)),
    })
  }

  const originalConversationId = conversation.isOwner
    ? conversation.conversationId
    : null

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col">
      <ReadOnlyConversation
        header={
          <div className="animate-in rounded-xl border bg-card px-4 py-3 duration-300 fade-in">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MessageSquareShare aria-hidden="true" className="size-3.5" />
              Hội thoại được chia sẻ · {formatDate(conversation.createdAt)}
            </p>
            <h1 className="mt-1 text-lg font-semibold break-words">
              {conversation.title || "Đoạn chat không có tiêu đề"}
            </h1>
          </div>
        }
        messages={messages}
        onOpenCitation={openCitation}
      />

      <div className="sticky bottom-0 mt-auto border-t bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {/* Same column as the messages above (max-w-3xl, px-4 md:px-8). */}
        <div className="mx-auto flex max-w-3xl flex-col items-stretch gap-2 px-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p className="text-xs text-muted-foreground">
            {conversation.isOwner
              ? "Đây là liên kết bạn đã chia sẻ."
              : "Tiếp tục để hỏi thêm trong một bản sao của riêng bạn."}
          </p>
          {conversation.isOwner ? (
            originalConversationId ? (
              <Button
                onClick={() =>
                  void navigate(chatConversationPath(originalConversationId))
                }
              >
                Mở hội thoại gốc
                <ArrowRight aria-hidden="true" />
              </Button>
            ) : null
          ) : (
            <Button disabled={continueShare.isPending} onClick={handleContinue}>
              {continueShare.isPending ? (
                <Loader2 aria-hidden="true" className="animate-spin" />
              ) : null}
              Tiếp tục cuộc trò chuyện
              {continueShare.isPending ? null : (
                <ArrowRight aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
      </div>

      <CitationDrawer
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />
    </div>
  )
}

function SharedConversationEmpty({
  description,
  onRetry,
  title,
}: {
  description: string
  onRetry?: () => void
  title: string
}) {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-md animate-in flex-col items-center px-4 py-16 text-center duration-300 fade-in">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
        <Link2Off aria-hidden="true" className="size-7" />
      </div>
      <h1 className="text-base font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {onRetry ? (
          <Button onClick={onRetry} variant="outline">
            <RotateCw aria-hidden="true" />
            Thử lại
          </Button>
        ) : null}
        <Button onClick={() => void navigate(ROUTES.chat)}>
          Về trang trò chuyện
        </Button>
      </div>
    </div>
  )
}
