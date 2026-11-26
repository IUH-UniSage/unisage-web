import type { Citation, Message } from "@/features/chat/schemas/chat-schemas"

export type CitationGroup = {
  // The citation the drawer opens on: the group's first (lowest index) one.
  first: Citation
  // The `[n]` markers in the reply that point at this document, ascending.
  indexes: number[]
  key: string
  pages: string | null
  // Host of a web-page source ("pdt.iuh.edu.vn"), null for a document.
  site: string | null
}

export const WEB_SOURCE_TYPE = "WEB"

// The page to open for a web-search source, or null for an uploaded document.
export function webCitationUrl(citation: Citation): string | null {
  return citation.sourceType === WEB_SOURCE_TYPE && citation.url
    ? citation.url
    : null
}

function siteOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "")
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
    const url = webCitationUrl(citation)
    const key = url
      ? `url:${url}`
      : (citation.documentId ?? `title:${citation.title}`)
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

  return [...groups.entries()].map(([key, group]) => {
    const url = webCitationUrl(group.first)
    return {
      first: group.first,
      indexes: [...group.indexes].sort((a, b) => a - b),
      key,
      pages: group.pages.length
        ? `tr. ${[...group.pages]
            .sort((a, b) => a.start - b.start)
            .map((page) => page.label)
            .join(", ")}`
        : null,
      site: url ? siteOf(url) : null,
    }
  })
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

// The other cited chunks of the same document in the reply that cited `citation`,
// one per page range, in page order - the document view lists them so a reader can
// jump between the pages one marker stands for (several chunks share one number).
export function sameDocumentCitations(
  messages: Message[],
  citation: Citation
): Citation[] {
  if (!citation.documentId) return [citation]
  const owner =
    messages.find((message) => message.citations?.includes(citation)) ??
    messages.find((message) =>
      message.citations?.some(
        (item) =>
          item.index === citation.index &&
          item.documentId === citation.documentId
      )
    )
  const seen = new Set<string>()
  return (owner?.citations ?? [citation])
    .filter((item) => item.documentId === citation.documentId)
    .sort((a, b) => (a.pageStart ?? 0) - (b.pageStart ?? 0))
    .filter((item) => {
      const label = toPageRange(item)?.label ?? ""
      if (seen.has(label)) return false
      seen.add(label)
      return true
    })
}

// Matches one `[n]` / `[n, m]` marker, not a markdown link's `[text](url)`.
const MARKER_PATTERN = /[ \t]*\[(\d+(?:\s*,\s*\d+)*)\](?!\()/g

/**
 * Fewer markers, same sources: an answer that cites one document on every bullet
 * shows that document's number once, at the end of the run, instead of on each line.
 *
 * - Within a line, a number cited twice keeps only its last marker.
 * - Consecutive lines (no blank line between) citing exactly the same numbers keep
 *   the markers on the last line of the run only.
 * Table rows and fenced code/math are left alone (each row stands on its own).
 * `numbers` maps a marker index to the number shown (one per document).
 */
export function thinCitationMarkers(
  content: string,
  numbers: Record<number, number>
): string {
  const lines = content.split("\n")
  const shownOf = (index: number) => numbers[index] ?? index
  let inFence = false
  const eligible = lines.map((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith("```") || trimmed.startsWith("$$")) {
      // A one-line `$$ … $$` opens and closes on the same line.
      const closesSameLine =
        trimmed.startsWith("$$") && trimmed.length > 2 && trimmed.endsWith("$$")
      if (!closesSameLine) inFence = !inFence
      return false
    }
    return !inFence && !trimmed.startsWith("|")
  })

  // 1) Within a line: keep each shown number's last marker only.
  const deduped = lines.map((line, lineIndex) => {
    if (!eligible[lineIndex]) return line
    const matches = [...line.matchAll(MARKER_PATTERN)]
    if (matches.length < 2) return line
    const lastAt = new Map<number, number>()
    matches.forEach((match, position) => {
      for (const n of match[1].split(",")) {
        lastAt.set(shownOf(Number(n.trim())), position)
      }
    })
    let position = -1
    return line.replace(MARKER_PATTERN, (whole, list: string) => {
      position += 1
      const kept = list
        .split(",")
        .map((n) => n.trim())
        .filter((n) => lastAt.get(shownOf(Number(n))) === position)
      if (!kept.length) return ""
      return whole.replace(/\[[^\]]*\]/, `[${kept.join(", ")}]`)
    })
  })

  // 2) A list whose items all cite the same sources: one marker set on the line that
  //    introduces the list ("… như sau [1][2]:"), so it reads as covering every item -
  //    on the last item it would look like only that item had a source. A list with
  //    no such lead-in line keeps its markers on each item.
  const shownSet = (line: string) =>
    [
      ...new Set(
        [...line.matchAll(MARKER_PATTERN)].flatMap((match) =>
          match[1].split(",").map((n) => shownOf(Number(n.trim())))
        )
      ),
    ]
      .sort((a, b) => a - b)
      .join(",")
  const indexesOf = (line: string) =>
    [...line.matchAll(MARKER_PATTERN)].flatMap((match) =>
      match[1].split(",").map((n) => Number(n.trim()))
    )
  const isListItem = (line: string) => LIST_ITEM_PATTERN.test(line)
  const result = [...deduped]
  let lineIndex = 0
  while (lineIndex < result.length) {
    const set = eligible[lineIndex] ? shownSet(result[lineIndex]) : ""
    if (!set || !isListItem(result[lineIndex])) {
      lineIndex += 1
      continue
    }
    let runEnd = lineIndex
    while (
      runEnd + 1 < result.length &&
      eligible[runEnd + 1] &&
      isListItem(result[runEnd + 1]) &&
      shownSet(result[runEnd + 1]) === set
    ) {
      runEnd += 1
    }
    const leadIn = leadInLine(result, eligible, lineIndex)
    if (runEnd > lineIndex && leadIn !== null) {
      const indexes = new Set<number>(indexesOf(result[leadIn]))
      for (let item = lineIndex; item <= runEnd; item += 1) {
        for (const index of indexesOf(result[item])) indexes.add(index)
        result[item] = result[item].replace(MARKER_PATTERN, "")
      }
      const withoutMarkers = result[leadIn].replace(MARKER_PATTERN, "")
      result[leadIn] = withoutMarkers.replace(
        /\s*:\s*$/,
        ` [${[...indexes].join(", ")}]:`
      )
    }
    lineIndex = runEnd + 1
  }
  return result.join("\n")
}

const LIST_ITEM_PATTERN = /^\s*(?:[-*+]|\d+[.)])\s+/

// The line just above a list (blank lines skipped) when it introduces it - a plain
// text line ending with ":" - else null.
function leadInLine(
  lines: string[],
  eligible: boolean[],
  listStart: number
): number | null {
  let candidate = listStart - 1
  while (candidate >= 0 && !lines[candidate].trim()) candidate -= 1
  if (candidate < 0 || !eligible[candidate]) return null
  const line = lines[candidate]
  if (LIST_ITEM_PATTERN.test(line) || /^\s*#/.test(line)) return null
  return /:\s*$/.test(line.replace(MARKER_PATTERN, "")) ? candidate : null
}

// The model sometimes still ends with its own source note although the reply's
// sources are listed by the app (citation_rules rule 4): a "Nguồn: …" line (with or
// without a bullet list under it) or a closing aside like "(Mọi mục trên được trích
// từ …)". Dropped when the reply carries citations, so the sources don't show twice.
// A last line that starts with "Nguồn:" but cites with [n] is content ("Nguồn: quỹ
// học bổng của trường [1]") and stays.
const SOURCE_LABEL_PATTERN =
  /^[ \t]*(?:[-*>][ \t]*)?(?:\*\*|_)?(?:Nguồn(?: tham (?:khảo|chiếu))?|Tài liệu tham khảo|Văn bản tham chiếu)[ \t]*(?:\*\*|_)?[ \t]*:(.*)$/i
const SOURCE_ASIDE_PATTERN = /^[ \t]*[*_]*\(([^()]*)\)[*_.]*[ \t]*$/
const SOURCE_ASIDE_WORDS =
  /(?:trích|lấy|tổng hợp|tham khảo)(?: dẫn)? từ|dựa (?:trên|theo) (?:các )?(?:văn bản|tài liệu|nguồn)|\bnguồn\b/i
const HAS_MARKER = /\[\d+(?:\s*,\s*\d+)*\](?!\()/

// Text that cites something: a marker next to real words, not markers alone.
function citesWithText(text: string): boolean {
  if (!HAS_MARKER.test(text)) return false
  return /[\p{L}\p{N}]/u.test(
    text
      .replace(new RegExp(MARKER_PATTERN.source, "g"), "")
      .replace(/[*_]/g, "")
  )
}

export function stripTrailingSourceLine(content: string): string {
  const lines = content.replace(/\s+$/, "").split("\n")
  const dropTrailingBlank = () => {
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop()
  }

  // A closing aside, then (or alone) a "Nguồn:" block.
  for (let pass = 0; pass < 2; pass += 1) {
    dropTrailingBlank()
    if (lines.length < 2) break
    const last = lines[lines.length - 1]
    const aside = last.match(SOURCE_ASIDE_PATTERN)
    if (aside && SOURCE_ASIDE_WORDS.test(aside[1]) && !HAS_MARKER.test(last)) {
      lines.pop()
      continue
    }

    // The "Nguồn:" label line, possibly followed by bullet lines that list documents.
    let labelAt = lines.length - 1
    while (labelAt > 0 && /^\s*[-*+]\s+/.test(lines[labelAt])) labelAt -= 1
    const label = lines[labelAt].match(SOURCE_LABEL_PATTERN)
    if (!label || labelAt === 0) break
    const block = [label[1], ...lines.slice(labelAt + 1)]
    if (block.some(citesWithText)) break
    lines.splice(labelAt)
  }
  dropTrailingBlank()
  return lines.join("\n")
}

// Shared start (in words) from which two titles count as "reading the same" when cut.
const SAME_START_MIN_WORDS = 3

/**
 * A label per group that tells apart documents whose titles start the same
 * ("Bản mô tả chương trình đào tạo đại học chính quy ngành …" for every programme):
 * the shared start is replaced by "…", keeping its last word for context. Titles that
 * stand out already are returned whole.
 */
export function distinctTitles(
  groups: CitationGroup[]
): Record<string, string> {
  const words = groups.map((group) => (group.first.title ?? "").split(/\s+/))
  const labels: Record<string, string> = {}
  groups.forEach((group, position) => {
    const own = words[position]
    let shared = 0
    words.forEach((other, otherPosition) => {
      if (otherPosition === position) return
      let common = 0
      while (
        common < own.length &&
        common < other.length &&
        own[common].toLocaleLowerCase("vi") ===
          other[common].toLocaleLowerCase("vi")
      ) {
        common += 1
      }
      shared = Math.max(shared, common)
    })
    const title = group.first.title ?? ""
    labels[group.key] =
      shared >= SAME_START_MIN_WORDS && shared < own.length
        ? `… ${own.slice(shared - 1).join(" ")}`
        : title
  })
  return labels
}
