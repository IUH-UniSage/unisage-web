import { MessageSquare, Search, X } from "lucide-react"
import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Conversation } from "@/features/chat/schemas/chat-schemas"
import { cn } from "@/lib/utils"

type SearchConversationDialogProps = {
  conversations: Conversation[]
  isOpen: boolean
  onClose: () => void
  onSelectConversation: (id: string) => void
}

export function SearchConversationDialog({
  conversations,
  isOpen,
  onClose,
  onSelectConversation,
}: SearchConversationDialogProps) {
  const [query, setQuery] = useState("")

  const normalized = query.trim().toLocaleLowerCase("vi")
  const filtered = conversations.filter((item) =>
    item.title.toLocaleLowerCase("vi").includes(normalized)
  )

  const handleClose = () => {
    setQuery("")
    onClose()
  }

  const handleSelect = (id: string) => {
    setQuery("")
    onSelectConversation(id)
    onClose()
  }

  return (
    <Dialog onOpenChange={(open) => !open && handleClose()} open={isOpen}>
      <DialogContent
        className="gap-0 overflow-hidden rounded-2xl border border-border/60 bg-popover p-0 shadow-2xl sm:max-w-120 dark:border-white/10"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Tìm kiếm đoạn chat</DialogTitle>
        </DialogHeader>

        {/* Search input header */}
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            className="h-7 border-0 bg-transparent! p-0 text-sm shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0 dark:text-white"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm..."
            value={query}
          />
          <button
            aria-label="Đóng tìm kiếm"
            className="size-6 cursor-pointer rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            onClick={handleClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Section label */}
        <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground/80">
          Đoạn chat gần đây
        </div>

        {/* List of conversations */}
        <ScrollArea className="max-h-[360px] min-h-[140px] px-2 pb-2">
          {filtered.length ? (
            <div className="space-y-0.5 p-1">
              {filtered.map((item) => (
                <button
                  className={cn(
                    "group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    "text-foreground/90 hover:bg-muted/80 hover:text-foreground dark:text-neutral-200 dark:hover:bg-white/10 dark:hover:text-white"
                  )}
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  type="button"
                >
                  <MessageSquare className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground dark:text-neutral-400 dark:group-hover:text-white" />
                  <span className="flex-1 truncate">{item.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-muted-foreground">
              Không tìm thấy đoạn chat phù hợp
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
