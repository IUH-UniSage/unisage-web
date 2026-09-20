import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { BrandMark } from "@/components/shared/brand/brand-mark"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AskUserFormCard } from "@/features/chat/components/ask-user-form"
import { ChatComposer } from "@/features/chat/components/chat-composer"
import { CitationChips } from "@/features/chat/components/citation-chips"
import type { Citation, Message } from "@/features/chat/schemas/chat-schemas"
import { extractAskUserForm } from "@/features/chat/utils/ask-user-form"
import {
  groupCitationsByDocument,
  markerNumbers,
} from "@/features/chat/utils/citations"
import { findQuestionBefore } from "@/features/chat/utils/question-before"
import { ReportMessageButton } from "@/features/support-tickets/components/report-message-button"

const PENDING_STATUSES = new Set(["PENDING", "STREAMING"])

type ActiveConversationProps = {
  isSending: boolean
  isStreaming: boolean
  messages: Message[]
  onOpenCitation: (citation: Citation) => void
  onSendMessage: (content: string) => void
  onStopGenerating: () => void
}

export function ActiveConversation({
  isSending,
  isStreaming,
  messages,
  onOpenCitation,
  onSendMessage,
  onStopGenerating,
}: ActiveConversationProps) {
  const lastMessage = messages.at(-1)
  const isWaitingForReply =
    isSending ||
    (lastMessage ? PENDING_STATUSES.has(lastMessage.status) : false)

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
                <div className="max-w-[85%] rounded-3xl bg-secondary px-5 py-3 text-[15px] leading-6 font-normal text-secondary-foreground shadow-2xs md:max-w-[75%]">
                  <MarkdownRenderer content={message.content} />
                </div>
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
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    Không thể tạo câu trả lời. Vui lòng thử lại.
                  </div>
                ) : !message.content ? (
                  <p className="text-sm text-muted-foreground italic">
                    Đã dừng tạo câu trả lời.
                  </p>
                ) : (
                  <AssistantReply
                    // The reply that followed this message - non-null only
                    // once the student has answered, which is what marks any
                    // ask_user_form in it as belonging to the past.
                    answerText={
                      messages.slice(index + 1).find((it) => it.role === "USER")
                        ?.content ?? null
                    }
                    content={message.content}
                    disabled={isWaitingForReply}
                    message={message}
                    onOpenCitation={onOpenCitation}
                    onSendMessage={onSendMessage}
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
      <ChatComposer
        disabled={isWaitingForReply}
        isStreaming={isStreaming}
        onStop={onStopGenerating}
        onSubmit={onSendMessage}
      />
    </>
  )
}

type AssistantReplyProps = {
  answerText: string | null
  content: string
  disabled: boolean
  message: Message
  onOpenCitation: (citation: Citation) => void
  onSendMessage: (content: string) => void
  questionText: string | null
  reportDisabled: boolean
}

function AssistantReply({
  answerText,
  content,
  disabled,
  message,
  onOpenCitation,
  onSendMessage,
  questionText,
  reportDisabled,
}: AssistantReplyProps) {
  const { form, text } = extractAskUserForm(content)
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
      <CitationChips citations={citations} onOpenCitation={onOpenCitation} />
      {form ? (
        <AskUserFormCard
          answerText={answerText}
          disabled={disabled}
          form={form}
          onSubmit={onSendMessage}
        />
      ) : null}
      <div className="flex items-center gap-1">
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
}

export function NewConversation({
  isSending,
  onSendMessage,
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
        <ChatComposer centered disabled={isSending} onSubmit={onSendMessage} />
      </div>
    </div>
  )
}
