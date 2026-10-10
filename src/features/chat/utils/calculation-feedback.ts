import type { Message } from "@/features/chat/schemas/chat-schemas"
import {
  type CalculationFeedbackEntry,
  calculationFeedbackMetadataSchema,
  type CalculationItem,
  calculationMetadataSchema,
} from "@/features/chat/schemas/calculation-schemas"

/** Items that get Đúng/Sai buttons: calculations the AI computed itself. */
export function readFeedbackItems(message: Message): CalculationItem[] {
  if (message.role !== "ASSISTANT") return []
  const parsed = calculationMetadataSchema.safeParse(
    message.metadata?.calculation
  )
  if (!parsed.success) return []
  return parsed.data.items.filter(
    (item) => item.mode === "llm" && item.status === "computed"
  )
}

/** `metadata.calculation_feedback` by item id; {} when absent or malformed. */
export function readCalculationFeedback(
  message: Message
): Record<string, CalculationFeedbackEntry> {
  const parsed = calculationFeedbackMetadataSchema.safeParse(
    message.metadata?.calculation_feedback
  )
  return parsed.success ? parsed.data : {}
}
