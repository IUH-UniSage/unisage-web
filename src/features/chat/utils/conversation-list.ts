import type { Conversation } from "@/features/chat/schemas/chat-schemas"

// Two titles that start the same are cut to the same text in a ~260px sidebar
// ("học phần tiên quyết của mô…" twice). Those rows get their time as a hint.
const SAME_START_LENGTH = 24

const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
})

function titleStart(title: string): string {
  return title.trim().toLocaleLowerCase("vi").slice(0, SAME_START_LENGTH)
}

/** Time label per conversation whose title would read the same as another's; others absent. */
export function ambiguousTitleHints(
  conversations: Conversation[]
): Record<string, string> {
  const counts = new Map<string, number>()
  for (const conversation of conversations) {
    const start = titleStart(conversation.title)
    counts.set(start, (counts.get(start) ?? 0) + 1)
  }

  const hints: Record<string, string> = {}
  for (const conversation of conversations) {
    if ((counts.get(titleStart(conversation.title)) ?? 0) < 2) continue
    const time = new Date(conversation.updatedAt ?? conversation.createdAt)
    if (!Number.isNaN(time.getTime())) {
      hints[conversation.id] = timeFormatter.format(time)
    }
  }
  return hints
}

/** Pinned first (newest pin on top), then the rest in the order the API returned. */
export function splitPinned(conversations: Conversation[]): {
  pinned: Conversation[]
  recent: Conversation[]
} {
  const pinned = conversations
    .filter((conversation) => conversation.pinnedAt)
    .sort((a, b) => (b.pinnedAt ?? "").localeCompare(a.pinnedAt ?? ""))
  return {
    pinned,
    recent: conversations.filter((conversation) => !conversation.pinnedAt),
  }
}
