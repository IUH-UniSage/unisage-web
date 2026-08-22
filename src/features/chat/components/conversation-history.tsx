import {
  Clock3,
  History,
  MessageSquarePlus,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { Conversation } from "@/features/chat/chat-data"
import { cn } from "@/lib/utils"

export type ConversationHistoryProps = {
  activeConversationId: string | null
  conversations: Conversation[]
  onDeleteConversation: (id: string) => void
  onNewConversation: () => void
  onRenameConversation: (id: string, title: string) => void
  onSearchQueryChange: (value: string) => void
  onSelectConversation: (id: string) => void
  onTogglePinConversation: (id: string) => void
  searchLabel: string
  searchQuery: string
}

export function ConversationHistory({
  activeConversationId,
  conversations,
  onDeleteConversation,
  onNewConversation,
  onRenameConversation,
  onSearchQueryChange,
  onSelectConversation,
  onTogglePinConversation,
  searchLabel,
  searchQuery,
}: ConversationHistoryProps) {
  const [editingConversationId, setEditingConversationId] = useState<
    string | null
  >(null)
  const [draftTitle, setDraftTitle] = useState("")
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("vi")
  const filteredConversations = conversations
    .filter((conversation) =>
      conversation.title.toLocaleLowerCase("vi").includes(normalizedQuery)
    )
    .sort((left, right) => Number(right.pinned) - Number(left.pinned))

  const cancelRenaming = () => {
    setEditingConversationId(null)
    setDraftTitle("")
  }

  const finishRenaming = () => {
    if (!editingConversationId) return

    const nextTitle = draftTitle.trim()
    if (nextTitle) {
      onRenameConversation(editingConversationId, nextTitle)
    }

    cancelRenaming()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 p-4">
        <Button className="w-full justify-start" onClick={onNewConversation}>
          <MessageSquarePlus aria-hidden="true" />
          Cuộc trò chuyện mới
        </Button>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label={searchLabel}
            className="h-9 bg-card pr-9 pl-9 dark:border-transparent dark:bg-muted"
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Tìm cuộc trò chuyện..."
            value={searchQuery}
          />
          {searchQuery ? (
            <Button
              aria-label="Xóa nội dung tìm kiếm"
              className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
              onClick={() => onSearchQueryChange("")}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
      <Separator />
      <ScrollArea className="min-h-0 flex-1">
        <div className="w-full min-w-0 overflow-hidden px-3 py-4">
          <div className="mb-3 flex items-center gap-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <History aria-hidden="true" className="size-3.5" />
            Gần đây
          </div>
          {filteredConversations.length ? (
            <div className="min-w-0 space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  className={cn(
                    "group flex w-full max-w-full min-w-0 items-center overflow-hidden rounded-lg transition-colors",
                    conversation.id === activeConversationId
                      ? "bg-secondary text-primary dark:text-secondary-foreground"
                      : "hover:bg-muted"
                  )}
                  key={conversation.id}
                >
                  {editingConversationId === conversation.id ? (
                    <div className="min-w-0 flex-1 px-2 py-2">
                      <Input
                        aria-label={`Đổi tên ${conversation.title}`}
                        autoFocus
                        className="h-8 bg-card"
                        onBlur={cancelRenaming}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault()
                            finishRenaming()
                          }

                          if (event.key === "Escape") {
                            cancelRenaming()
                          }
                        }}
                        value={draftTitle}
                      />
                    </div>
                  ) : (
                    <button
                      className="min-w-0 flex-1 overflow-hidden px-3 py-3 text-left"
                      onClick={() => onSelectConversation(conversation.id)}
                      type="button"
                    >
                      <span className="block truncate text-sm leading-5 font-medium">
                        {conversation.title}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {conversation.pinned ? (
                          <Pin aria-hidden="true" className="size-3" />
                        ) : null}
                        {conversation.date}
                      </span>
                    </button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label={`Tùy chọn cho ${conversation.title}`}
                        className="mr-1 opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
                        size="icon-sm"
                        variant="ghost"
                      >
                        <MoreHorizontal aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onSelect={() => {
                          setEditingConversationId(conversation.id)
                          setDraftTitle(conversation.title)
                        }}
                      >
                        <Pencil aria-hidden="true" />
                        Đổi tên
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          onTogglePinConversation(conversation.id)
                        }
                      >
                        {conversation.pinned ? (
                          <PinOff aria-hidden="true" />
                        ) : (
                          <Pin aria-hidden="true" />
                        )}
                        {conversation.pinned
                          ? "Bỏ ghim"
                          : "Ghim cuộc trò chuyện"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => onDeleteConversation(conversation.id)}
                        variant="destructive"
                      >
                        <Trash2 aria-hidden="true" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-2 rounded-lg border border-dashed px-3 py-6 text-center">
              <Search
                aria-hidden="true"
                className="mx-auto mb-2 size-5 text-muted-foreground"
              />
              <p className="text-sm font-medium">Không tìm thấy hội thoại</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Thử tìm bằng từ khóa khác.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="shrink-0 border-t p-4">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 aria-hidden="true" className="size-3.5" />
          Lịch sử được lưu trong 90 ngày
        </p>
      </div>
    </div>
  )
}
