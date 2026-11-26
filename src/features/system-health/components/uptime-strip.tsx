import { useMemo } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSystemHealthHistoryQuery } from "@/features/system-health/queries/use-queries"
import {
  getHealthStatusDotClassName,
  HEALTH_STATUS_LABELS,
  type HealthCheckResponse,
} from "@/features/system-health/schemas/system-health-schemas"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/utils/date"

// ~24h of checks at the backend's 5-minute cadence.
const UPTIME_WINDOW = 288
// Checks folded into one bar, so the strip stays readable on a phone.
const CHECKS_PER_BAR = 6

const STATUS_SEVERITY = {
  DEGRADED: 2,
  DOWN: 3,
  OUT_OF_SERVICE: 1,
  UP: 0,
} as const

type UptimeBar = {
  from: string
  status: HealthCheckResponse["overallStatus"]
  to: string
}

/** Oldest-first bars, each showing the worst status among its checks. */
function toBars(checks: HealthCheckResponse[]): UptimeBar[] {
  const oldestFirst = [...checks].reverse()
  const bars: UptimeBar[] = []
  for (let index = 0; index < oldestFirst.length; index += CHECKS_PER_BAR) {
    const group = oldestFirst.slice(index, index + CHECKS_PER_BAR)
    const worst = group.reduce((current, check) =>
      STATUS_SEVERITY[check.overallStatus] >
      STATUS_SEVERITY[current.overallStatus]
        ? check
        : current
    )
    bars.push({
      from: group[0].checkedAt,
      status: worst.overallStatus,
      to: group[group.length - 1].checkedAt,
    })
  }
  return bars
}

/**
 * The last 24 hours at a glance. A page of identical "Hoạt động tốt" rows
 * says less than one strip where an incident stands out in colour.
 */
export function UptimeStrip() {
  const { data, isPending } = useSystemHealthHistoryQuery({
    limit: UPTIME_WINDOW,
    page: 1,
  })

  const checks = useMemo(() => data?.data ?? [], [data])
  const bars = useMemo(() => toBars(checks), [checks])
  const upCount = checks.filter((check) => check.overallStatus === "UP").length
  const uptime = checks.length ? (upCount / checks.length) * 100 : null

  if (isPending) return <Skeleton className="h-20" />
  if (!checks.length) return null

  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">24 giờ qua</p>
        <p className="text-sm text-muted-foreground">
          Thời gian hoạt động tốt{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {uptime === null
              ? "—"
              : `${uptime.toFixed(uptime === 100 ? 0 : 2)}%`}
          </span>{" "}
          · {checks.length} lần kiểm tra
        </p>
      </div>
      <div
        aria-label="Trạng thái hệ thống trong 24 giờ qua"
        className="mt-3 flex h-8 items-stretch gap-px"
        role="img"
      >
        {bars.map((bar) => (
          <Tooltip key={bar.from}>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "min-w-0 flex-1 rounded-[2px] opacity-80 hover:opacity-100",
                  getHealthStatusDotClassName(bar.status)
                )}
              />
            </TooltipTrigger>
            <TooltipContent>
              {formatDateTime(bar.from)} – {formatDateTime(bar.to)}:{" "}
              {HEALTH_STATUS_LABELS[bar.status]}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>24 giờ trước</span>
        <span>Hiện tại</span>
      </div>
    </div>
  )
}
