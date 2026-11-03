import type { Message } from "@/features/chat/schemas/chat-schemas"
import type { SharedMessage } from "@/features/conversations/schemas/share-schemas"

/**
 * A snapshot message in the shape the chat components render. Only COMPLETED
 * messages are ever shared (spec R2). The snapshot hides the original
 * conversation id from non-owners, so `conversationId` is empty: it is only
 * read by calculation feedback, which read-only mode never renders.
 */
export function toReadOnlyMessage(message: SharedMessage): Message {
  return {
    chatModelId: null,
    citations: message.citations,
    content: message.content,
    conversationId: "",
    createdAt: message.createdAt,
    id: message.id,
    metadata: message.metadata,
    retrievalScore: null,
    role: message.role,
    status: "COMPLETED",
  }
}
