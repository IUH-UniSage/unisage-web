import {
  Clock3,
  History,
  MessageSquarePlus,
  MoreHorizontal,
  Search,
  Trash2,
  X,
} from "lucide-react"

import { BrandMark } from "@/components/shared/brand/brand-mark"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { Conversation } from "@/features/chat/schemas/chat-schemas"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/utils/date"

export type ConversationHistoryProps = {
  activeConversationId: string | null
  conversations: Conversation[]
  onDeleteConversation: (id: string) => void
  onNewConversation: () => void
  onSearchQueryChange: (value: string) => void
  onSelectConversation: (id: string) => void
  searchLabel: string
  searchQuery: string
}

type CollapsedHistoryRailProps = {
  onExpand: () => void
  onNewConversation: () => void
}

export function CollapsedHistoryRail({
  onExpand,
  onNewConversation,
}: CollapsedHistoryRailProps) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center gap-1 py-3">
      <Button
        aria-label="Mở lịch sử trò chuyện"
        onClick={onExpand}
        size="icon"
        variant="ghost"
      >
        <BrandMark className="size-6" />
      </Button>
      <Button
        aria-label="Cuộc trò chuyện mới"
        onClick={onNewConversation}
        size="icon"
        variant="ghost"
      >
        <MessageSquarePlus aria-hidden="true" />
      </Button>
      <Button
        aria-label="Tìm cuộc trò chuyện"
        onClick={onExpand}
        size="icon"
        variant="ghost"
      >
        <Search aria-hidden="true" />
      </Button>
    </div>
  )
}

export function ConversationHistory({
  activeConversationId,
  conversations,
  onDeleteConversation,
  onNewConversation,
  onSearchQueryChange,
  onSelectConversation,
  searchLabel,
  searchQuery,
}: ConversationHistoryProps) {
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("vi")
  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLocaleLowerCase("vi").includes(normalizedQuery)
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 p-4">
        <Button
          className="w-full justify-start rounded-xl"
          onClick={onNewConversation}
        >
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
            className="h-9 rounded-xl bg-card pr-9 pl-9 dark:border-transparent dark:bg-muted"
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
            <div className="min-w-0 space-y-0.5">
              {filteredConversations.map((conversation) => (
                <div
                  className={cn(
                    "group flex w-full max-w-full min-w-0 items-center overflow-hidden rounded-xl transition-colors",
                    conversation.id === activeConversationId
                      ? "bg-secondary/70 text-primary dark:text-secondary-foreground"
                      : "hover:bg-muted/70"
                  )}
                  key={conversation.id}
                >
                  <button
                    className="min-w-0 flex-1 overflow-hidden px-3 py-2.5 text-left"
                    onClick={() => onSelectConversation(conversation.id)}
                    type="button"
                  >
                    <span className="block truncate text-sm leading-5 font-medium">
                      {conversation.title}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      {formatRelativeTime(conversation.createdAt)}
                    </span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label={`Tùy chọn cho ${conversation.title}`}
                        className="mr-1 rounded-full opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
                        size="icon-sm"
                        variant="ghost"
                      >
                        <MoreHorizontal aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
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
            <div className="mx-2 rounded-2xl border border-dashed px-3 py-6 text-center">
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
