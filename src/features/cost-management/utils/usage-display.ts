type UsageRequester = {
  guestIp: string | null
  userEmail?: string | null
  userId: string | null
}

export function getUsageRequesterLabel(log: UsageRequester): string {
  if (log.userEmail) return log.userEmail
  if (log.userId) return log.userId
  if (log.guestIp) return `Khách · ${log.guestIp}`
  return "-"
}

// A request with an unpriced line only has an estimate for that line, so the
// total is shown as priced cost plus the estimate, flagged as approximate.
export function getUsageTotalCost(log: {
  estimatedUnpricedCostUsd: number
  totalCostUsd: number | null
}): { approximate: boolean; value: number } {
  return {
    approximate: log.estimatedUnpricedCostUsd > 0,
    value: (log.totalCostUsd ?? 0) + log.estimatedUnpricedCostUsd,
  }
}

export function formatTokens(value: number): string {
  return value.toLocaleString("vi-VN")
}

export function formatLatency(ms: number): string {
  return ms >= 1000
    ? `${(ms / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} s`
    : `${ms} ms`
}
