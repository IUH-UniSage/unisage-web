import type { Message } from "@/features/chat/schemas/chat-schemas"
import {
  type GroundingMetadata,
  groundingMetadataSchema,
} from "@/features/chat/schemas/grounding-schemas"

/** The grounding findings of an assistant reply; null when none or malformed. */
export function readGrounding(message: Message): GroundingMetadata | null {
  if (message.role !== "ASSISTANT") return null
  const parsed = groundingMetadataSchema.safeParse(message.metadata?.grounding)
  if (!parsed.success) return null
  const { miscited = [], ungrounded = [] } = parsed.data
  return miscited.length || ungrounded.length ? parsed.data : null
}
