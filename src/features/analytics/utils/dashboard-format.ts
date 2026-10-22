import type {
  ActivityBucket,
  AnswerWindow,
  DashboardPeriod,
  PeriodInfo,
} from "@/features/analytics/schemas/dashboard-schemas"

export const DASHBOARD_PERIOD_LABELS = {
  LAST_30_DAYS: "30 ngày",
  LAST_7_DAYS: "7 ngày",
  THIS_MONTH: "Tháng này",
  TODAY: "Hôm nay",
} as const satisfies Record<DashboardPeriod, string>

export const DASHBOARD_PERIODS = [
  "TODAY",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "THIS_MONTH",
] as const satisfies readonly DashboardPeriod[]

const COMPARISON_LABELS = {
  LAST_30_DAYS: "so với 30 ngày trước đó",
  LAST_7_DAYS: "so với 7 ngày trước đó",
  THIS_MONTH: "so với cùng kỳ tháng trước",
  TODAY: "so với cùng giờ hôm qua",
} as const satisfies Record<DashboardPeriod, string>

export function isDashboardPeriod(value: string): value is DashboardPeriod {
  return (DASHBOARD_PERIODS as readonly string[]).includes(value)
}

// Backend sends app-timezone wall-clock times without an offset, so the parts
// are read straight off the string rather than through Date (which would shift
// them by the viewer's own timezone).
function timeOf(localDateTime: string): string {
  return localDateTime.slice(11, 16)
}

function dayMonthOf(localDateTime: string): string {
  return `${localDateTime.slice(8, 10)}/${localDateTime.slice(5, 7)}`
}

export function describePeriod(period: PeriodInfo): string {
  const range =
    period.key === "TODAY"
      ? `Từ 00:00 đến ${timeOf(period.to)}`
      : `${dayMonthOf(period.from)} – ${dayMonthOf(period.to)}, đến ${timeOf(period.to)}`
  return `${range} · ${COMPARISON_LABELS[period.key]}`
}

export function formatBucketLabel(
  start: string,
  granularity: PeriodInfo["granularity"]
): string {
  return granularity === "HOUR"
    ? `${start.slice(11, 13)} giờ`
    : dayMonthOf(start)
}

/** Relative change in percent, or null when there is no previous value to compare with. */
export function percentChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

/** Share of non-failed answers that cite at least one source, in percent. */
export function citedRate(window: AnswerWindow): number | null {
  const answered = window.total - window.failed
  return answered > 0 ? (window.cited / answered) * 100 : null
}

export function failureRate(window: AnswerWindow): number | null {
  return window.total > 0 ? (window.failed / window.total) * 100 : null
}

export function formatCount(value: number): string {
  return value.toLocaleString("vi-VN")
}

export function formatRate(value: number): string {
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`
}

export function formatSignedPercent(value: number, unit = "%"): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : ""
  const magnitude = Math.abs(value).toLocaleString("vi-VN", {
    maximumFractionDigits: 1,
  })
  return `${sign}${magnitude}${unit}`
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} giây`
}

export function findPeakBucket(
  buckets: ActivityBucket[]
): ActivityBucket | null {
  return buckets.reduce<ActivityBucket | null>((peak, bucket) => {
    const total = bucket.answered + bucket.failed
    if (total === 0) return peak
    if (!peak || total > peak.answered + peak.failed) return bucket
    return peak
  }, null)
}
