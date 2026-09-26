import type {
  ChatModel,
  ChatModelPurpose,
  ChatModelSourceType,
  ChatModelStatus,
  ChatModelVerificationSummary,
} from "@/features/chat-models/schemas/chat-model-schemas"
import { getVerificationStatusLabel } from "@/features/chat-models/schemas/verification-status"

// Mirrors com.unisage.backend.entity.enums.ChatModelSourceType — keep in
// sync with the backend enum (name + displayName) when it changes.
const SOURCE_TYPE_LABELS = {
  CLOUD_API: "Nhà cung cấp cloud",
  SELF_HOSTED: "Tự host",
} as const satisfies Record<ChatModelSourceType, string>

export function getSourceTypeLabel(sourceType: ChatModelSourceType): string {
  return SOURCE_TYPE_LABELS[sourceType]
}

// Mirrors com.unisage.backend.entity.enums.ChatModelPurpose.
const PURPOSE_LABELS = {
  CHAT: "Chat",
  EMBEDDING: "Embedding",
  EXTRACTION: "Trích xuất",
} as const satisfies Record<ChatModelPurpose, string>

export function getPurposeLabel(purpose: ChatModelPurpose): string {
  return PURPOSE_LABELS[purpose]
}

// Mirrors com.unisage.backend.entity.enums.ChatModelStatus (plan.md "State machine").
const STATUS_LABELS = {
  ACTIVE: "Đang hoạt động",
  DISABLED: "Đã tự động khoá",
  INACTIVE: "Không hoạt động",
  PENDING: "Chờ xác minh",
} as const satisfies Record<ChatModelStatus, string>

export function getStatusLabel(status: ChatModelStatus): string {
  return STATUS_LABELS[status]
}

const QUEUED_STALE_AFTER_MS = 5 * 60 * 1000

/**
 * todo.md Task 17: a QUEUED job older than 5 minutes reads as "đang chờ
 * agent" instead of the plain "Đang chờ xác minh" label — the verifier
 * (unisage-agent) likely isn't picking jobs up. Falls back to the plain
 * label when there's no `createdAt` to compute age from, or the status
 * isn't recognized (getVerificationStatusLabel handles unknown values).
 */
export function getVerificationStatusDisplayLabel(
  verification: Pick<ChatModelVerificationSummary, "createdAt" | "status">,
  now: Date = new Date()
): string {
  if (verification.status === "QUEUED" && verification.createdAt) {
    const createdAt = new Date(verification.createdAt).getTime()
    if (
      !Number.isNaN(createdAt) &&
      now.getTime() - createdAt > QUEUED_STALE_AFTER_MS
    ) {
      return "Đang chờ agent"
    }
  }

  return getVerificationStatusLabel(verification.status)
}

export type ActivateBlockedReason = {
  code: "DISABLED" | "NEVER_VERIFIED"
  message: string
}

/**
 * plan.md "State machine": activate (INACTIVE -> ACTIVE) is only reachable
 * from INACTIVE with a prior successful verify. PENDING (never verified) and
 * DISABLED (circuit-broken, needs re-verify first) both reject with 409 on
 * the backend — this mirrors that matrix client-side so the button can be
 * disabled with an explanatory tooltip instead of round-tripping a 409.
 */
export function getActivateBlockedReason(
  chatModel: ChatModel
): ActivateBlockedReason | null {
  if (chatModel.status === "DISABLED") {
    return {
      code: "DISABLED",
      message: "Đã bị khoá do lỗi liên tục — xác minh lại trước khi kích hoạt.",
    }
  }

  if (chatModel.status === "PENDING" || chatModel.verifiedAt == null) {
    return {
      code: "NEVER_VERIFIED",
      message: "Chưa được xác minh — không thể kích hoạt.",
    }
  }

  return null
}
