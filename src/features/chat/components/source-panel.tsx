import { ChevronRight } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { CHAT_SOURCES } from "@/features/chat/chat-data"

export function SourcePanel() {
  return (
    <aside className="hidden min-h-0 border-l bg-muted/30 xl:block dark:border-white/[0.06] dark:bg-card">
      <ScrollArea className="h-full">
        <div className="space-y-3 p-4">
          {CHAT_SOURCES.map((source, index) => (
            <button
              className="group w-full rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/25 dark:border-white/[0.06] dark:bg-muted/45"
              key={source.title}
              type="button"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="grid size-8 place-items-center rounded-lg bg-secondary text-xs font-bold text-primary dark:text-info">
                  {index + 1}
                </div>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </div>
              <p className="line-clamp-2 text-sm leading-5 font-semibold break-words">
                {source.title}
              </p>
              <p className="mt-2 line-clamp-3 text-xs leading-5 break-words text-muted-foreground">
                {source.meta}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
