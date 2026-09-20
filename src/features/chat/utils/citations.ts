import type { Citation, Message } from "@/features/chat/schemas/chat-schemas"

export type CitationGroup = {
  // The citation the drawer opens on: the group's first (lowest index) one.
  first: Citation
  // The `[n]` markers in the reply that point at this document, ascending.
  indexes: number[]
  key: string
  pages: string | null
}

type PageRange = { label: string; start: number }

function toPageRange(citation: Citation): PageRange | null {
  if (citation.pageStart == null) return null
  const label =
    citation.pageEnd != null && citation.pageEnd !== citation.pageStart
      ? `${citation.pageStart}-${citation.pageEnd}`
      : String(citation.pageStart)
  return { label, start: citation.pageStart }
}

// One entry per document, however many chunks of it were cited - the numbered
// `[n]` markers in the text still each keep their own page.
export function groupCitationsByDocument(
  citations: Citation[]
): CitationGroup[] {
  const groups = new Map<
    string,
    { first: Citation; indexes: number[]; pages: PageRange[] }
  >()

  for (const citation of citations) {
    const key = citation.documentId ?? `title:${citation.title}`
    const page = toPageRange(citation)
    const group = groups.get(key)

    if (!group) {
      groups.set(key, {
        first: citation,
        indexes: [citation.index],
        pages: page ? [page] : [],
      })
      continue
    }

    group.indexes.push(citation.index)
    if (page && !group.pages.some((item) => item.label === page.label)) {
      group.pages.push(page)
    }
  }

  return [...groups.entries()].map(([key, group]) => ({
    first: group.first,
    indexes: [...group.indexes].sort((a, b) => a - b),
    key,
    pages: group.pages.length
      ? `tr. ${[...group.pages]
          .sort((a, b) => a.start - b.start)
          .map((page) => page.label)
          .join(", ")}`
      : null,
  }))
}

// What the reader sees for each `[n]`: the position of its document in the source
// list (1, 2, ...), so text markers, chips and cards all count the same way even
// when several chunks of one document were cited.
export function markerNumbers(groups: CitationGroup[]): Record<number, number> {
  const numbers: Record<number, number> = {}
  groups.forEach((group, position) => {
    for (const index of group.indexes) numbers[index] = position + 1
  })
  return numbers
}

// The sources the panel shows: those of the newest assistant reply (none if it cites nothing).
export function latestCitations(messages: Message[]): Citation[] {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === "ASSISTANT") {
      return messages[index].citations ?? []
    }
  }
  return []
}
