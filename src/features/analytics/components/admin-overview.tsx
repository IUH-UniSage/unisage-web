import { useSearchParams } from "react-router-dom"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { ActivityCard } from "@/features/analytics/components/overview/activity-card"
import { AttentionStrip } from "@/features/analytics/components/overview/attention-strip"
import { CostCard } from "@/features/analytics/components/overview/cost-card"
import { KpiCards } from "@/features/analytics/components/overview/kpi-cards"
import { PlatformStatus } from "@/features/analytics/components/overview/platform-status"
import { useDashboardSummaryQuery } from "@/features/analytics/queries/use-queries"
import type {
  DashboardPeriod,
  DashboardSummary,
} from "@/features/analytics/schemas/dashboard-schemas"
import {
  DASHBOARD_PERIOD_LABELS,
  DASHBOARD_PERIODS,
  describePeriod,
  isDashboardPeriod,
} from "@/features/analytics/utils/dashboard-format"
import {
  getHealthStatusDotClassName,
  HEALTH_STATUS_LABELS,
} from "@/features/system-health/schemas/system-health-schemas"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/date"
import { getErrorMessage } from "@/utils/error-handler"

const DEFAULT_PERIOD: DashboardPeriod = "TODAY"
const PERIOD_PARAM_KEY = "period"

function usePeriodParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get(PERIOD_PARAM_KEY) ?? DEFAULT_PERIOD
  const period = isDashboardPeriod(raw) ? raw : DEFAULT_PERIOD

  const setPeriod = (next: DashboardPeriod) => {
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous)
        if (next === DEFAULT_PERIOD) params.delete(PERIOD_PARAM_KEY)
        else params.set(PERIOD_PARAM_KEY, next)
        return params
      },
      { replace: true }
    )
  }

  return [period, setPeriod] as const
}

export function AdminOverviewPage() {
  const [period, setPeriod] = usePeriodParam()
  const summaryQuery = useDashboardSummaryQuery(period)

  return (
    <div className="space-y-6">
      <PageHeader summary={summaryQuery.data} />

      {summaryQuery.isPending ? (
        <DashboardSkeleton />
      ) : summaryQuery.isError ? (
        <Card className="border-destructive/30 bg-destructive/5 shadow-none">
          <CardContent className="p-6 text-sm font-medium text-destructive">
            Không thể tải dữ liệu tổng quan:{" "}
            {getErrorMessage(summaryQuery.error)}
          </CardContent>
        </Card>
      ) : (
        <>
          <AttentionStrip attention={summaryQuery.data.attention} />

          <PeriodToolbar
            isRefreshing={summaryQuery.isPlaceholderData}
            onPeriodChange={setPeriod}
            period={period}
            summary={summaryQuery.data}
          />

          <div
            className={cn(
              "space-y-6 transition-opacity",
              summaryQuery.isPlaceholderData && "opacity-60"
            )}
          >
            <div {...tourAnchor(TOUR_ANCHORS.overviewMetrics)}>
              <KpiCards summary={summaryQuery.data} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
              <ActivityCard summary={summaryQuery.data} />
              <CostCard summary={summaryQuery.data} />
            </div>
          </div>

          <PlatformStatus summary={summaryQuery.data} />
        </>
      )}
    </div>
  )
}

function PageHeader({ summary }: { summary: DashboardSummary | undefined }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div {...tourAnchor(TOUR_ANCHORS.pageHeader)}>
        <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
          Điều hành nền tảng
        </p>
        <h1 className="mt-2 text-2xl font-bold md:text-3xl">
          Tổng quan hệ thống
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Việc cần xử lý ngay, chất lượng trả lời của AI và chi phí theo khoảng
          thời gian.
        </p>
      </div>
      {summary ? (
        <div className="flex items-center gap-2 self-start rounded-full border bg-card px-3 py-2 text-xs text-muted-foreground sm:self-auto">
          <span
            aria-hidden="true"
            className={cn(
              "size-2 rounded-full",
              getHealthStatusDotClassName(summary.health.overallStatus)
            )}
          />
          <span className="font-medium text-foreground">
            Dịch vụ: {HEALTH_STATUS_LABELS[summary.health.overallStatus]}
          </span>
          · kiểm tra lúc{" "}
          {formatDate(summary.health.checkedAt, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ) : null}
    </div>
  )
}

function PeriodToolbar({
  isRefreshing,
  onPeriodChange,
  period,
  summary,
}: {
  isRefreshing: boolean
  onPeriodChange: (period: DashboardPeriod) => void
  period: DashboardPeriod
  summary: DashboardSummary
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        onValueChange={(value) => {
          if (isDashboardPeriod(value)) onPeriodChange(value)
        }}
        value={period}
      >
        <TabsList aria-label="Khoảng thời gian" className="w-full sm:w-fit">
          {DASHBOARD_PERIODS.map((key) => (
            <TabsTrigger className="px-3" key={key} value={key}>
              {DASHBOARD_PERIOD_LABELS[key]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <p aria-live="polite" className="text-xs text-muted-foreground">
        {isRefreshing ? "Đang tải…" : describePeriod(summary.period)}
      </p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Đang tải tổng quan hệ thống">
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-14 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  )
}
