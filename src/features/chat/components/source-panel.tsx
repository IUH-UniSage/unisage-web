import { BookOpen, ChevronRight, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CHAT_SOURCES } from "@/features/chat/chat-data"

type SourcePanelProps = {
  onClose?: () => void
  width?: number
}

export function SourcePanel({ onClose, width = 260 }: SourcePanelProps) {
  return (
    <aside
      className="hidden min-h-0 shrink-0 flex-col overflow-hidden border-l border-border/40 bg-muted/40 xl:flex dark:border-white/[0.06] dark:bg-muted/15"
      style={{ width: `${width}px` }}
    >
      {/* Top Header of Source Panel (Full height to top, matching sidebar header h-14) */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-3.5">
        <div className="flex items-center gap-2">
          <BookOpen aria-hidden="true" className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Nguồn tham chiếu
          </h2>
          <Badge className="ml-0.5 size-4.5 justify-center rounded-full bg-muted p-0 text-[10px] leading-none text-muted-foreground">
            {CHAT_SOURCES.length}
          </Badge>
        </div>
        {onClose ? (
          <Button
            aria-label="Đóng nguồn tham chiếu"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        ) : null}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2.5 p-3">
          {CHAT_SOURCES.map((source, index) => (
            <button
              className="group w-full rounded-xl border border-border/60 bg-background/80 p-3 text-left transition-colors hover:border-primary/40 hover:bg-background dark:bg-muted/40"
              key={source.title}
              type="button"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="grid size-6 place-items-center rounded-full bg-secondary text-xs font-bold text-primary dark:text-info">
                  {index + 1}
                </div>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </div>
              <p className="line-clamp-2 text-xs leading-4.5 font-semibold break-words text-foreground">
                {source.title}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-4 break-words text-muted-foreground">
                {source.meta}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
