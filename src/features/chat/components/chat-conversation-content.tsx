import { Check, Copy } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"

import { BrandMark } from "@/components/shared/brand/brand-mark"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { CalculationFeedback } from "@/features/chat/components/calculation-feedback"
import {
  ChatComposer,
  ChatDisclaimer,
} from "@/features/chat/components/chat-composer"
import {
  AnsweredClarificationCard,
  CancelledClarificationCard,
} from "@/features/chat/components/clarification/answered-clarification-card"
import {
  ClarificationPanel,
  type ClarificationSubmitPayload,
} from "@/features/chat/components/clarification/clarification-panel"
import { CitationChips } from "@/features/chat/components/citation-chips"
import { LegacyAskUserFormNotice } from "@/features/chat/components/legacy-ask-user-form-notice"
import type { Citation, Message } from "@/features/chat/schemas/chat-schemas"
import {
  type OpenPanel,
  readAnsweredCard,
  readClarification,
} from "@/features/chat/utils/clarification-state"
import {
  readCalculationFeedback,
  readFeedbackItems,
} from "@/features/chat/utils/calculation-feedback"
import { stripLegacyAskUserForm } from "@/features/chat/utils/legacy-ask-user-form"
import { useChatReplyTour } from "@/features/product-tour"
import {
  groupCitationsByDocument,
  markerNumbers,
} from "@/features/chat/utils/citations"
import { findQuestionBefore } from "@/features/chat/utils/question-before"
import { ReportMessageButton } from "@/features/support-tickets/components/report-message-button"

const PENDING_STATUSES = new Set(["PENDING", "STREAMING"])

type ActiveConversationProps = {
  clarification: {
    errors: Record<string, string>
    isAwaitingPreviousAnswer: boolean
    isCancelling: boolean
    onCancel: () => void
    onSubmit: (
      payload: ClarificationSubmitPayload & { panel: OpenPanel["panel"] }
    ) => void
    openPanel: OpenPanel | null
  }
  isSending: boolean
  isStreaming: boolean
  messages: Message[]
  onOpenCitation: (citation: Citation) => void
  onSendMessage: (content: string) => void
  onStopGenerating: () => void
  usageWarning?: ReactNode
}

export function ActiveConversation({
  clarification,
  isSending,
  isStreaming,
  messages,
  onOpenCitation,
  onSendMessage,
  onStopGenerating,
  usageWarning,
}: ActiveConversationProps) {
  const { openPanel } = clarification
  const lastMessage = messages.at(-1)
  const isWaitingForReply =
    isSending ||
    (lastMessage ? PENDING_STATUSES.has(lastMessage.status) : false)
  const latestReplyIndex = messages.findLastIndex(
    (message) => message.role === "ASSISTANT" && message.status === "COMPLETED"
  )
  // Once the first answer is in, explain what can be done with it.
  useChatReplyTour(latestReplyIndex >= 0 && !isWaitingForReply && !isStreaming)

  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto max-w-3xl space-y-7 px-4 py-6 md:px-8 md:py-10">
          {messages.map((message, index) =>
            message.role === "USER" ? (
              <div
                className="group flex animate-in flex-col items-end gap-1.5 duration-300 fade-in slide-in-from-bottom-2"
                key={message.id}
              >
                <UserTurn message={message} previous={messages[index - 1]} />
              </div>
            ) : (
              <div
                className="group w-full animate-in space-y-2 py-1 duration-300 fade-in slide-in-from-bottom-2"
                key={message.id}
              >
                {PENDING_STATUSES.has(message.status) && !message.content ? (
                  <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                    <span className="animate-pulse">Đang suy nghĩ...</span>
                  </div>
                ) : message.status === "ERROR" ? (
                  <>
                    {/* What streamed before the failure stays readable. */}
                    {message.content ? (
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                        {message.content}
                      </p>
                    ) : null}
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {message.errorMessage ??
                        "Không thể tạo câu trả lời. Vui lòng thử lại."}
                    </div>
                  </>
                ) : !message.content && !readClarification(message) ? (
                  <p className="text-sm text-muted-foreground italic">
                    Đã dừng tạo câu trả lời.
                  </p>
                ) : (
                  <AssistantReply
                    content={message.content}
                    isLatest={index === latestReplyIndex}
                    message={message}
                    onOpenCitation={onOpenCitation}
                    questionText={findQuestionBefore(messages, index)}
                    // Ids are only the server's once the stream is done and
                    // the messages are refetched.
                    reportDisabled={
                      isSending || isStreaming || message.status !== "COMPLETED"
                    }
                  />
                )}
              </div>
            )
          )}
          {isSending && !messages.length ? (
            <p className="text-sm text-muted-foreground">Đang gửi...</p>
          ) : null}
        </div>
      </ScrollArea>
      {usageWarning}
      {openPanel ? (
        // The panel takes the composer's place (same container and width): the
        // student answers or cancels it before asking anything else.
        <div className="border-t border-border/40 px-4 py-3 md:px-6">
          <ClarificationPanel
            busy={clarification.isCancelling || isSending}
            key={openPanel.panel.panel_id}
            onCancel={clarification.onCancel}
            onSubmit={(payload) =>
              clarification.onSubmit({ ...payload, panel: openPanel.panel })
            }
            panel={openPanel.panel}
            serverErrors={clarification.errors}
          />
          <ChatDisclaimer />
        </div>
      ) : (
        <ChatComposer
          // 4093 keeps it locked while the previous answer is still processed.
          disabled={isWaitingForReply || clarification.isAwaitingPreviousAnswer}
          isStreaming={isStreaming}
          onStop={onStopGenerating}
          onSubmit={onSendMessage}
        />
      )}
    </>
  )
}

// A submit turn of the question panel renders as the bordered answer card;
// any other USER message stays a plain bubble.
function UserTurn({
  message,
  previous,
}: {
  message: Message
  previous: Message | undefined
}) {
  const answers = readAnsweredCard(message)
  if (!answers) {
    return (
      <div className="max-w-[85%] rounded-3xl bg-secondary px-5 py-3 text-[15px] leading-6 font-normal text-secondary-foreground shadow-2xs md:max-w-[75%]">
        <MarkdownRenderer content={message.content} />
      </div>
    )
  }

  const previousPanel =
    previous?.role === "ASSISTANT"
      ? (readClarification(previous)?.panel ?? null)
      : null
  return (
    <div className="w-full max-w-[92%] md:max-w-[75%]">
      <AnsweredClarificationCard answers={answers} panel={previousPanel} />
    </div>
  )
}

type AssistantReplyProps = {
  content: string
  // Only the newest reply carries tour anchors, so the reply tour points at
  // what the student just read rather than the top of a long thread.
  isLatest: boolean
  message: Message
  onOpenCitation: (citation: Citation) => void
  questionText: string | null
  reportDisabled: boolean
}

function AssistantReply({
  content,
  isLatest,
  message,
  onOpenCitation,
  questionText,
  reportDisabled,
}: AssistantReplyProps) {
  const { form: legacyForm, text } = stripLegacyAskUserForm(content)
  const clarification = readClarification(message)
  const feedbackItems = readFeedbackItems(message)
  const feedback = readCalculationFeedback(message)
  const citations = message.citations ?? []
  const numbers = markerNumbers(groupCitationsByDocument(citations))

  return (
    <>
      <div className="w-full">
        <MarkdownRenderer
          citationMarkers={
            citations.length
              ? {
                  indexes: citations.map((citation) => citation.index),
                  numbers,
                  onSelect: (index) => {
                    const citation = citations.find(
                      (item) => item.index === index
                    )
                    if (citation) onOpenCitation(citation)
                  },
                }
              : undefined
          }
          content={text}
        />
      </div>
      {feedbackItems.length ? (
        // One Đúng/Sai row per retrieved result, in `items` order.
        <div className="space-y-2">
          {feedbackItems.map((item) => (
            <CalculationFeedback
              conversationId={message.conversationId}
              current={feedback[item.item_id]}
              disabled={reportDisabled}
              item={item}
              key={item.item_id}
              messageId={message.id}
            />
          ))}
        </div>
      ) : null}
      {citations.length ? (
        <div {...(isLatest ? tourAnchor(TOUR_ANCHORS.chatReplyCitations) : {})}>
          <CitationChips
            citations={citations}
            onOpenCitation={onOpenCitation}
          />
        </div>
      ) : null}
      {legacyForm ? <LegacyAskUserFormNotice form={legacyForm} /> : null}
      {clarification?.status === "cancelled" ? (
        <CancelledClarificationCard panel={clarification.panel} />
      ) : null}
      <div
        {...(isLatest ? tourAnchor(TOUR_ANCHORS.chatReplyActions) : {})}
        className="flex items-center gap-1"
      >
        <CopyMessageButton content={text} />
        <ReportMessageButton
          disabled={reportDisabled}
          message={message}
          questionText={questionText}
        />
      </div>
    </>
  )
}

function CopyMessageButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <Button
      aria-label={copied ? "Đã chép" : "Sao chép"}
      className="size-7 text-muted-foreground hover:text-foreground"
      onClick={() => void handleCopy()}
      size="icon"
      title={copied ? "Đã chép" : "Sao chép"}
      variant="ghost"
    >
      {copied ? (
        <Check className="size-4 text-emerald-500" />
      ) : (
        <Copy className="size-4" />
      )}
    </Button>
  )
}

type NewConversationProps = {
  isSending: boolean
  onSendMessage: (content: string) => void
  usageWarning?: ReactNode
}

export function NewConversation({
  isSending,
  onSendMessage,
  usageWarning,
}: NewConversationProps) {
  return (
    <div className="chat-empty-ambient flex min-h-0 flex-1 flex-col px-4 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:items-center md:justify-center md:py-8">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center md:flex-none">
        <BrandMark className="size-14 md:size-16" />
        <h2 className="mt-4 text-lg font-semibold tracking-tight md:mt-5 md:text-xl">
          Bắt đầu cuộc trò chuyện mới
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground md:max-w-md">
          Đặt câu hỏi về quy định học tập, thủ tục sinh viên hoặc các tài liệu
          trong thư viện tri thức.
        </p>
      </div>
      <div className="w-full shrink-0 md:mt-8 md:max-w-3xl">
        {usageWarning}
        <ChatComposer centered disabled={isSending} onSubmit={onSendMessage} />
      </div>
    </div>
  )
}
