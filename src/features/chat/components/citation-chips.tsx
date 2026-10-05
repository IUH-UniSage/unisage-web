import { FileText, Globe } from "lucide-react"

import type { Citation } from "@/features/chat/schemas/chat-schemas"
import { groupCitationsByDocument } from "@/features/chat/utils/citations"

type CitationChipsProps = {
  citations: Citation[]
  onOpenCitation: (citation: Citation) => void
}

// The reply's sources, one chip per document or web page, shown under the answer.
export function CitationChips({
  citations,
  onOpenCitation,
}: CitationChipsProps) {
  const groups = groupCitationsByDocument(citations)
  if (!groups.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="text-xs font-medium text-muted-foreground">Nguồn:</span>
      {groups.map((group, position) => {
        const SourceIcon = group.site ? Globe : FileText
        return (
          <button
            className="flex max-w-full items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-left text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
            key={group.key}
            onClick={() => onOpenCitation(group.first)}
            type="button"
          >
            <SourceIcon
              aria-hidden="true"
              className="size-3.5 shrink-0 text-primary"
            />
            <span className="shrink-0 font-semibold text-primary">
              {position + 1}
            </span>
            <span className="truncate">{group.first.title}</span>
            {group.pages || group.site ? (
              <span className="shrink-0 text-muted-foreground">
                {group.pages ?? group.site}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
