import type { LucideIcon } from "lucide-react"
import {
  Bot,
  MessageSquareQuote,
  Timer,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { DashboardSummary } from "@/features/analytics/schemas/dashboard-schemas"
import {
  citedRate,
  formatCount,
  formatDuration,
  formatRate,
  formatSignedPercent,
  percentChange,
} from "@/features/analytics/utils/dashboard-format"
import { cn } from "@/lib/utils"

export type Delta = {
  // Whether a rise is good news (more answers) or bad news (slower answers).
  higherIsBetter: boolean
  unit?: string
  value: number
}

type Kpi = {
  delta: Delta | null
  detail: string
  icon: LucideIcon
  label: string
  value: string
}

export function KpiCards({ summary }: { summary: DashboardSummary }) {
  const { answers, askers } = summary
  const askerTotal = askers.current.users + askers.current.guests
  const previousAskerTotal = askers.previous.users + askers.previous.guests
  const cited = citedRate(answers.current)
  const previousCited = citedRate(answers.previous)
  const median = answers.current.medianResponseMs
  const previousMedian = answers.previous.medianResponseMs

  const kpis: Kpi[] = [
    {
      delta: toDelta(
        percentChange(answers.current.total, answers.previous.total),
        true
      ),
      detail: `Kỳ trước: ${formatCount(answers.previous.total)}`,
      icon: Bot,
      label: "Câu trả lời AI",
      value: formatCount(answers.current.total),
    },
    {
      delta: toDelta(percentChange(askerTotal, previousAskerTotal), true),
      detail: `${formatCount(askers.current.users)} tài khoản · ${formatCount(askers.current.guests)} khách`,
      icon: Users,
      label: "Người đặt câu hỏi",
      value: formatCount(askerTotal),
    },
    {
      delta:
        median != null && previousMedian != null
          ? toDelta(percentChange(median, previousMedian), false)
          : null,
      detail:
        answers.current.p95ResponseMs != null
          ? `95% câu trả lời xong trong ${formatDuration(answers.current.p95ResponseMs)}`
          : "Chưa có câu trả lời hoàn tất",
      icon: Timer,
      label: "Thời gian trả lời (trung vị)",
      value: median != null ? formatDuration(median) : "—",
    },
    {
      delta:
        cited != null && previousCited != null
          ? {
              higherIsBetter: true,
              unit: " điểm %",
              value: cited - previousCited,
            }
          : null,
      detail: "Trên các câu trả lời không bị lỗi",
      icon: MessageSquareQuote,
      label: "Câu trả lời có dẫn nguồn",
      value: cited != null ? formatRate(cited) : "—",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  )
}

function toDelta(value: number | null, higherIsBetter: boolean): Delta | null {
  return value == null ? null : { higherIsBetter, value }
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon

  return (
    <Card className="border bg-card shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{kpi.value}</p>
          </div>
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
            <Icon aria-hidden="true" className="size-5" />
          </div>
        </div>
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          <DeltaLine delta={kpi.delta} />
          <p>{kpi.detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function DeltaLine({
  delta,
  neutral = false,
}: {
  delta: Delta | null
  // Cost going up is not good or bad by itself, so it is shown without a verdict color.
  neutral?: boolean
}) {
  if (delta == null) {
    return <p>Kỳ trước chưa có dữ liệu để so sánh</p>
  }

  const rounded = Math.round(delta.value * 10) / 10
  const Icon = rounded < 0 ? TrendingDown : TrendingUp
  const isGood = rounded === 0 ? null : rounded > 0 === delta.higherIsBetter
  const toneClassName =
    neutral || isGood == null
      ? "text-foreground"
      : isGood
        ? "text-success"
        : "text-destructive"

  return (
    <p className="flex items-center gap-1">
      {rounded !== 0 ? (
        <Icon aria-hidden="true" className={cn("size-3.5", toneClassName)} />
      ) : null}
      <span className={cn("font-semibold tabular-nums", toneClassName)}>
        {formatSignedPercent(rounded, delta.unit)}
      </span>
      so với kỳ trước
    </p>
  )
}
