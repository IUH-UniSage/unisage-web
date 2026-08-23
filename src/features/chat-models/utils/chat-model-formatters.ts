import type { ChatModelSourceType } from "@/features/chat-models/schemas/chat-model-schemas"

// Mirrors com.unisage.backend.entity.enums.ChatModelSourceType — keep in
// sync with the backend enum (name + displayName) when it changes.
const SOURCE_TYPE_LABELS = {
  CLOUD_API: "Nhà cung cấp cloud",
  SELF_HOSTED: "Tự host",
} as const satisfies Record<ChatModelSourceType, string>

export function getSourceTypeLabel(sourceType: ChatModelSourceType): string {
  return SOURCE_TYPE_LABELS[sourceType]
}
