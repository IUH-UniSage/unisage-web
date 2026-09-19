import type { Message } from "@/features/chat/schemas/chat-schemas"

// The user's question an assistant reply answers: the closest USER message
// before it. Used to pre-fill the title when the reply is reported as a ticket.
export function findQuestionBefore(
  messages: readonly Message[],
  index: number
): string | null {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "USER") return messages[i].content
  }
  return null
}
