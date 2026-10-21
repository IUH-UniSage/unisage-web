import type { UsageWindow } from "@/features/usage-limits/schemas/usage-limit-schemas"
import { formatDateTime, parseApiDate } from "@/utils/date"

/** A window is "running low" once at most this much of it is left (i.e. 80% or more is used). */
export const USAGE_WARNING_REMAINING_PERCENT = 20

const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

/** "24 phút", "2 giờ 5 phút", "3 ngày 4 giờ" - the two largest non-zero units. */
export function formatTimeUntil(resetAt: string, now: number = Date.now()) {
  const target = parseApiDate(resetAt)?.getTime()
  if (target === undefined) return null

  const remaining = Math.max(0, target - now)
  if (remaining < MINUTE_MS) return "dưới 1 phút"

  const days = Math.floor(remaining / DAY_MS)
  const hours = Math.floor((remaining % DAY_MS) / HOUR_MS)
  const minutes = Math.floor((remaining % HOUR_MS) / MINUTE_MS)

  if (days > 0) return hours > 0 ? `${days} ngày ${hours} giờ` : `${days} ngày`
  if (hours > 0) {
    return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`
  }
  return `${minutes} phút`
}

/** Absolute reset time in Vietnam time, e.g. "10:00 22/09/2026". */
export function formatResetTime(resetAt: string) {
  const formatted = formatDateTime(resetAt)
  return formatted === "-" ? resetAt : formatted
}

export function isRunningLow(window: UsageWindow) {
  return (
    window.status === "ACTIVE" &&
    window.remainingPercent != null &&
    window.remainingPercent <= USAGE_WARNING_REMAINING_PERCENT
  )
}

// Message for a blocked request; `errors` is the API's { window, resetAt } detail.
export function describeUsageLimitExceeded(
  errors?: Record<string, string> | null
) {
  const windowLabel = errors?.window === "WEEKLY" ? "7 ngày" : "24 giờ"
  const resetAt = errors?.resetAt
  const untilReset = resetAt ? formatTimeUntil(resetAt) : null

  return untilReset && resetAt
    ? `Bạn đã dùng hết hạn mức ${windowLabel}. Có thể hỏi tiếp sau ${untilReset} (${formatResetTime(resetAt)}).`
    : `Bạn đã dùng hết hạn mức ${windowLabel}. Hãy quay lại sau khi hạn mức được làm mới.`
}

export function formatTokenLimit(limit: number | null | undefined) {
  return limit == null ? "Không giới hạn" : limit.toLocaleString("vi-VN")
}
