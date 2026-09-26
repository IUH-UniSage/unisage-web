/**
 * Hand-maintained until the contract-sync tooling (`pnpm contracts:sync`,
 * todo.md "Task 0.8") exists. That tool doesn't exist anywhere in this
 * codebase yet, so this type is copied by hand from the backend's source of
 * truth and must be kept in sync manually:
 * `backend-java/contracts/verification-statuses.json` (generated from the
 * Java enum `ChatModelVerificationStatus`, plan.md "Trạng thái verification").
 *
 * When the sync tool ships, this file is replaced by the generated one and
 * can be deleted.
 */
export const VERIFICATION_STATUSES = [
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "SUPERSEDED",
  "CANCELLED",
  "REINDEX_REQUIRED",
] as const

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number]

// Nhãn UI theo bảng "Trạng thái verification" trong plan.md - Record đầy đủ
// nên thiếu 1 giá trị là lỗi compile.
export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  CANCELLED: "Đã huỷ",
  FAILED: "Xác minh thất bại",
  QUEUED: "Đang chờ xác minh",
  REINDEX_REQUIRED: "Cần re-index — chưa áp dụng",
  RUNNING: "Đang xác minh",
  SUCCEEDED: "Đã xác minh",
  SUPERSEDED: "Đã bị thay bằng thay đổi mới hơn",
}

const UNKNOWN_STATUS_LABEL = "Không xác định"

export function isVerificationStatus(
  value: string
): value is VerificationStatus {
  return (VERIFICATION_STATUSES as readonly string[]).includes(value)
}

/**
 * Defensive against drift between backend and this hand-copied union: an
 * unrecognized value never crashes the page, it just renders as "Không xác
 * định" and logs a warning so the mismatch gets noticed.
 */
export function getVerificationStatusLabel(value: string): string {
  if (isVerificationStatus(value)) {
    return VERIFICATION_STATUS_LABELS[value]
  }

  console.warn(
    `[chat-models] Giá trị verification status không xác định: "${value}". ` +
      "Kiểm tra lệch giữa backend ChatModelVerificationStatus và " +
      "verification-status.ts (hand-maintained, chưa có contracts:sync)."
  )

  return UNKNOWN_STATUS_LABEL
}
