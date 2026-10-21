import type { ChatStatus } from "@/features/chat/schemas/chat-progress-schemas"

// unisage-agent contracts/chat-sse.md §2: the stages `event: status` sends.
const STAGE_LABELS: Record<string, string> = {
  analyzing: "Đang phân tích",
  calculating: "Đang tính toán",
  generating: "Đang tạo câu trả lời",
  retrieving: "Đang tìm thông tin",
  thinking: "Đang suy nghĩ",
  web_searching: "Đang tìm kiếm web",
}

const SECONDS = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
})

/** "3,2s": tenths of a second, rounded down so it never runs ahead. */
export function formatElapsed(milliseconds: number): string {
  return `${SECONDS.format(Math.floor(Math.max(0, milliseconds) / 100) / 10)}s`
}

/** The line shown while the turn runs; a stage this client does not know yet reads as
 * "thinking", and no status yet (the request just left) too. */
export function progressLabel(status: ChatStatus | null): string {
  if (status?.url) return `Đang tìm kiếm trên ${shortUrl(status.url)}`
  return STAGE_LABELS[status?.stage ?? "thinking"] ?? STAGE_LABELS.thinking
}

/** Host without `www.` plus the readable (decoded) path. */
export function shortUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const path = decodeURIComponent(parsed.pathname).replace(/\/$/, "")
    return `${parsed.hostname.replace(/^www\./, "")}${path}`
  } catch {
    return url
  }
}

const RESPONSE_SECONDS = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

/** "16,24s": a finished answer's stored response time, to the hundredth. */
export function formatResponseTime(milliseconds: number): string {
  return `${RESPONSE_SECONDS.format(Math.max(0, milliseconds) / 1000)}s`
}
