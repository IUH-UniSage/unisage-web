import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import type { DashboardSummary } from "@/features/analytics/schemas/dashboard-schemas"
import {
  failureRate,
  findPeakBucket,
  formatBucketLabel,
  formatCount,
  formatRate,
} from "@/features/analytics/utils/dashboard-format"

const ANSWERED_COLOR = "var(--color-chart-2)"
const FAILED_COLOR = "var(--color-destructive)"

type ChartRow = { answered: number; failed: number; label: string }

export function ActivityCard({ summary }: { summary: DashboardSummary }) {
  const { activity, answers, period } = summary
  const hourly = period.granularity === "HOUR"
  const unit = hourly ? "giờ" : "ngày"

  const rows = useMemo<ChartRow[]>(
    () =>
      activity.map((bucket) => ({
        answered: bucket.answered,
        failed: bucket.failed,
        label: formatBucketLabel(bucket.start, period.granularity),
      })),
    [activity, period.granularity]
  )

  const average =
    activity.length > 0 ? answers.current.total / activity.length : 0
  const failures = failureRate(answers.current)
  const peak = findPeakBucket(activity)

  return (
    <Card
      {...tourAnchor(TOUR_ANCHORS.overviewActivity)}
      className="border bg-card shadow-none"
    >
      <CardHeader className="border-b">
        <CardTitle>Hoạt động trợ lý AI</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Câu trả lời mỗi {unit}, tách phần bị lỗi
        </p>
      </CardHeader>
      <CardContent className="p-5 md:p-6">
        <div
          aria-hidden="true"
          className="mb-3 flex items-center gap-4 text-xs text-muted-foreground"
        >
          <LegendItem color={ANSWERED_COLOR} label="Trả lời được" />
          <LegendItem color={FAILED_COLOR} label="Lỗi" />
        </div>
        <div className="h-64" aria-hidden="true">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              data={rows}
              margin={{ bottom: 0, left: -24, right: 4, top: 4 }}
            >
              <CartesianGrid
                stroke="var(--color-border)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="label"
                fontSize={11}
                interval="preserveStartEnd"
                minTickGap={12}
                stroke="var(--color-muted-foreground)"
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                fontSize={11}
                stroke="var(--color-muted-foreground)"
                tickLine={false}
              />
              <Tooltip
                content={<ActivityTooltip />}
                cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
              />
              <Bar
                dataKey="answered"
                fill={ANSWERED_COLOR}
                maxBarSize={36}
                stackId="answers"
              />
              <Bar
                dataKey="failed"
                fill={FAILED_COLOR}
                maxBarSize={36}
                radius={[4, 4, 0, 0]}
                stackId="answers"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ActivityTable rows={rows} unit={unit} />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MiniStat
            label={`Trung bình mỗi ${unit}`}
            value={average.toLocaleString("vi-VN", {
              maximumFractionDigits: 1,
            })}
          />
          <MiniStat
            label="Câu trả lời lỗi"
            value={
              failures != null
                ? `${formatCount(answers.current.failed)} · ${formatRate(failures)}`
                : "0"
            }
          />
          <MiniStat
            label="Cao điểm"
            value={
              peak
                ? `${formatBucketLabel(peak.start, period.granularity)} · ${formatCount(peak.answered + peak.failed)}`
                : "—"
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  )
}

type TooltipPayload = { dataKey?: unknown; payload?: ChartRow }

function ActivityTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: readonly TooltipPayload[]
}) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="font-semibold">{row.label}</p>
      <p className="mt-1 flex items-center gap-1.5">
        <span
          className="size-2 rounded-sm"
          style={{ background: ANSWERED_COLOR }}
        />
        Trả lời được:{" "}
        <span className="font-semibold tabular-nums">
          {formatCount(row.answered)}
        </span>
      </p>
      <p className="flex items-center gap-1.5">
        <span
          className="size-2 rounded-sm"
          style={{ background: FAILED_COLOR }}
        />
        Lỗi:{" "}
        <span className="font-semibold tabular-nums">
          {formatCount(row.failed)}
        </span>
      </p>
    </div>
  )
}

// Screen-reader equivalent of the bar chart.
function ActivityTable({ rows, unit }: { rows: ChartRow[]; unit: string }) {
  return (
    <table className="sr-only">
      <caption>Câu trả lời AI theo {unit}</caption>
      <thead>
        <tr>
          <th scope="col">Thời điểm</th>
          <th scope="col">Trả lời được</th>
          <th scope="col">Lỗi</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{row.answered}</td>
            <td>{row.failed}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-4">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}
