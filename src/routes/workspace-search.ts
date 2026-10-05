import type { LucideIcon } from "lucide-react"

import type { NavigationItem } from "@/routes/feature-registry"
import { WORKSPACE_SEARCH_KEYWORDS } from "@/routes/workspace-search-keywords"

export type WorkspaceSearchResult = {
  icon: LucideIcon
  id: string
  label: string
  // Sidebar item label a tab result belongs to; undefined for a page result.
  parentLabel?: string
  to: string
}

type SearchCandidate = WorkspaceSearchResult & {
  keywords: readonly string[]
  order: number
}

// Lowercase and strip Vietnamese diacritics ("Phân quyền" -> "phan quyen"),
// so a query matches regardless of whether the user typed accents.
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

function buildCandidates(items: readonly NavigationItem[]): SearchCandidate[] {
  return items.flatMap((item, index) => {
    const entry = WORKSPACE_SEARCH_KEYWORDS[item.key]
    const page: SearchCandidate = {
      icon: item.icon,
      id: item.key,
      keywords: entry?.keywords ?? [],
      label: item.label,
      order: index * 100,
      to: item.to,
    }
    const tabs = (entry?.tabs ?? []).map<SearchCandidate>((tab, tabIndex) => ({
      icon: item.icon,
      id: `${item.key}:${tab.value}`,
      keywords: tab.keywords,
      label: tab.label,
      order: index * 100 + tabIndex + 1,
      parentLabel: item.label,
      to: `${item.to}?tab=${encodeURIComponent(tab.value)}`,
    }))

    return [page, ...tabs]
  })
}

// Lower is better; null = no match. Every query token must appear somewhere
// in the candidate's label, its parent's label, or its keywords.
function scoreCandidate(
  candidate: SearchCandidate,
  query: string,
  tokens: readonly string[]
): number | null {
  const label = normalizeSearchText(candidate.label)
  const parent = normalizeSearchText(candidate.parentLabel ?? "")
  const keywords = candidate.keywords.map(normalizeSearchText)
  const haystack = [label, parent, ...keywords].join(" | ")

  if (!tokens.every((token) => haystack.includes(token))) return null

  const tabPenalty = candidate.parentLabel ? 1 : 0
  if (label === query) return 0 + tabPenalty
  if (label.startsWith(query)) return 2 + tabPenalty
  if (label.includes(query)) return 4 + tabPenalty
  if (keywords.some((keyword) => keyword === query)) return 6 + tabPenalty
  if (keywords.some((keyword) => keyword.startsWith(query))) {
    return 8 + tabPenalty
  }
  if (keywords.some((keyword) => keyword.includes(query))) {
    return 10 + tabPenalty
  }
  return 12 + tabPenalty
}

export function searchWorkspace(
  items: readonly NavigationItem[],
  rawQuery: string,
  limit = 8
): WorkspaceSearchResult[] {
  const query = normalizeSearchText(rawQuery)
  if (!query) return []

  const tokens = query.split(" ")

  return buildCandidates(items)
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, query, tokens),
    }))
    .filter(
      (match): match is { candidate: SearchCandidate; score: number } =>
        match.score !== null
    )
    .sort((a, b) => a.score - b.score || a.candidate.order - b.candidate.order)
    .slice(0, limit)
    .map(({ candidate }) => ({
      icon: candidate.icon,
      id: candidate.id,
      label: candidate.label,
      parentLabel: candidate.parentLabel,
      to: candidate.to,
    }))
}
