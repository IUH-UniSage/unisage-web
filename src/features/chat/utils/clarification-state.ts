import type { Message } from "@/features/chat/schemas/chat-schemas"
import {
  type ClarificationAnswers,
  clarificationAnswersSchema,
  type ClarificationMetadata,
  clarificationMetadataSchema,
  type ClarificationPanel,
} from "@/features/chat/schemas/clarification-schemas"

export type OpenPanel = {
  assistantMessageId: string
  panel: ClarificationPanel
}

/** `metadata.clarification` of a message, or null when absent or malformed. */
export function readClarification(
  message: Message
): ClarificationMetadata | null {
  const parsed = clarificationMetadataSchema.safeParse(
    message.metadata?.clarification
  )
  return parsed.success ? parsed.data : null
}

/**
 * The question panel waiting for an answer, derived from the messages alone
 * (contract §5): open if and only if the conversation's last message is a
 * COMPLETED ASSISTANT message whose `metadata.clarification.status` is
 * "open". Nothing else is stored client-side, so a reload or reopening the
 * conversation shows exactly what the server has.
 */
export function deriveOpenPanel(messages: Message[]): OpenPanel | null {
  const last = messages.at(-1)
  if (!last || last.role !== "ASSISTANT" || last.status !== "COMPLETED") {
    return null
  }

  const clarification = readClarification(last)
  if (clarification?.status !== "open") return null

  return { assistantMessageId: last.id, panel: clarification.panel }
}

/**
 * The answers behind the bordered card that replaces a USER bubble, or null
 * for an ordinary USER message (including a malformed payload, which then
 * falls back to the plain bubble with the text summary).
 */
export function readAnsweredCard(
  message: Message
): ClarificationAnswers | null {
  if (message.role !== "USER") return null

  const parsed = clarificationAnswersSchema.safeParse(
    message.metadata?.clarification_answers
  )
  return parsed.success ? parsed.data : null
}
