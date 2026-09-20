import { BookOpen, Bookmark, ChevronRight, FileText, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Citation } from "@/features/chat/schemas/chat-schemas"
import { groupCitationsByDocument } from "@/features/chat/utils/citations"

type SourcePanelProps = {
  citations: Citation[]
  onClose?: () => void
  onOpenCitation: (citation: Citation) => void
  width?: number
}

export function SourcePanel({
  citations,
  onClose,
  onOpenCitation,
  width = 280,
}: SourcePanelProps) {
  const groups = groupCitationsByDocument(citations)

  return (
    <aside
      className="hidden min-h-0 shrink-0 flex-col overflow-hidden border-l border-border/60 bg-muted/30 backdrop-blur-xs xl:flex dark:border-white/[0.08] dark:bg-muted/10"
      style={{ width: `${width}px` }}
    >
      {/* Top Header of Source Panel */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/60 px-4 backdrop-blur-md dark:border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
            <BookOpen aria-hidden="true" className="size-4" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Nguồn tham chiếu
            </h2>
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary ring-1 ring-primary/20">
              {groups.length}
            </span>
          </div>
        </div>
        {onClose ? (
          <Button
            aria-label="Đóng nguồn tham chiếu"
            className="size-8 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        ) : null}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 p-3.5">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/40 px-4 py-10 text-center">
              <div className="mb-2.5 grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                <BookOpen className="size-5 opacity-60" />
              </div>
              <p className="text-xs leading-relaxed font-medium text-muted-foreground">
                Chưa có nguồn tham chiếu cho câu trả lời hiện tại.
              </p>
            </div>
          ) : null}
          {groups.map((group, position) => (
            <button
              className="group relative flex w-full flex-col gap-2 rounded-xl border border-border/70 bg-card p-3.5 text-left shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-border/50 dark:bg-card/70 dark:hover:border-primary/50 dark:hover:bg-card"
              key={group.key}
              onClick={() => onOpenCitation(group.first)}
              type="button"
            >
              {/* Header row: Badge + Title + Arrow */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                  <div className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/10 font-mono text-xs font-bold text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {position + 1}
                  </div>
                  <p className="line-clamp-2 text-xs leading-snug font-semibold tracking-tight break-words text-foreground transition-colors group-hover:text-primary">
                    {group.first.title}
                  </p>
                </div>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </div>

              {/* Section quote indicator */}
              {group.first.section ? (
                <div className="relative mt-0.5 line-clamp-2 rounded-md border-l-2 border-primary/40 bg-muted/60 px-2.5 py-1.5 text-[11px] leading-relaxed font-medium text-muted-foreground">
                  <Bookmark className="mr-1 inline-block size-3 align-text-bottom text-primary/70" />
                  {group.first.section}
                </div>
              ) : null}

              {/* Pages metadata pill */}
              {group.pages ? (
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <FileText className="size-3 shrink-0" />
                    {group.pages}
                  </span>
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
