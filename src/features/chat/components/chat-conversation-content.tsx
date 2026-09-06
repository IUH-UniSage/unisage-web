import { BrandMark } from "@/components/shared/brand/brand-mark"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatComposer } from "@/features/chat/components/chat-composer"
import type { Message } from "@/features/chat/schemas/chat-schemas"

const PENDING_STATUSES = new Set(["PENDING", "STREAMING"])

type ActiveConversationProps = {
  isSending: boolean
  isStreaming: boolean
  messages: Message[]
  onSendMessage: (content: string) => void
  onStopGenerating: () => void
}

export function ActiveConversation({
  isSending,
  isStreaming,
  messages,
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
          {messages.map((message) =>
            message.role === "USER" ? (
              <div
                className="group flex flex-col items-end gap-1.5"
                key={message.id}
              >
                <div className="max-w-[85%] rounded-3xl bg-secondary px-5 py-3 text-[15px] leading-6 font-normal text-secondary-foreground shadow-2xs md:max-w-[75%]">
                  <MarkdownRenderer content={message.content} />
                </div>
              </div>
            ) : (
              <div className="w-full space-y-2 py-1" key={message.id}>
                {PENDING_STATUSES.has(message.status) && !message.content ? (
                  <div className="flex animate-pulse items-center gap-2 py-1 text-sm text-muted-foreground">
                    <span className="size-2 rounded-full bg-primary/60" />
                    <span>Đang suy nghĩ...</span>
                  </div>
                ) : message.status === "ERROR" ? (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    Không thể tạo câu trả lời. Vui lòng thử lại.
                  </div>
                ) : (
                  <div className="w-full">
                    <MarkdownRenderer content={message.content} />
                  </div>
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
