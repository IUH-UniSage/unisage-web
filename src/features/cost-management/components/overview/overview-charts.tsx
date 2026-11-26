import { useMemo } from "react"
import type { ReactNode } from "react"
import type { UseQueryResult } from "@tanstack/react-query"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { OverviewBreakdownGroupBy } from "@/features/cost-management/hooks/use-overview-tab"
import type { UsageLogSummary } from "@/features/cost-management/schemas/cost-management-schemas"
import { formatUsd } from "@/features/cost-management/utils/format-cost"
import {
  fillDailyBuckets,
  formatDayTick,
} from "@/features/cost-management/utils/fill-daily-buckets"
import { getUsagePurposeLabelByKey } from "@/features/cost-management/utils/purpose-labels"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/utils/error-handler"

function formatTooltipUsd(value: unknown) {
  return formatUsd(typeof value === "number" ? value : Number(value))
}

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

// Same order as CHART_COLORS, as utilities for the HTML legend.
const LEGEND_SWATCH_CLASSNAMES = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
]

function ChartCardShell({
  children,
  title,
  headerAction,
}: {
  children: ReactNode
  headerAction?: ReactNode
  title: string
}) {
  return (
    <Card className="border bg-card shadow-none">
      <CardHeader className="flex-row items-center justify-between gap-4">
        <CardTitle>{title}</CardTitle>
        {headerAction}
      </CardHeader>
      <CardContent className="h-72 p-5 pt-0">{children}</CardContent>
    </Card>
  )
}

function QueryState({
  query,
  isEmpty,
}: {
  isEmpty: boolean
  query: UseQueryResult<UsageLogSummary>
}) {
  if (query.isPending) {
    return <Skeleton className="h-full w-full" />
  }
  if (query.isError) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-destructive">
        {getErrorMessage(query.error)}
      </p>
    )
  }
  if (isEmpty) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Không có dữ liệu trong khoảng thời gian đã chọn
      </p>
    )
  }
  return null
}

export function DonutByPurposeCard({
  query,
}: {
  query: UseQueryResult<UsageLogSummary>
}) {
  const data = useMemo(
    () =>
      (query.data?.buckets ?? [])
        .filter((bucket) => bucket.pricedCostUsd > 0)
        .map((bucket) => ({
          name: getUsagePurposeLabelByKey(bucket.key),
          value: bucket.pricedCostUsd,
        })),
    [query.data]
  )

  const total = data.reduce((sum, entry) => sum + entry.value, 0)

  return (
    <ChartCardShell title="Chi phí theo mục đích">
      <QueryState isEmpty={data.length === 0} query={query} />
      {!query.isPending && !query.isError && data.length > 0 ? (
        <div className="flex h-full flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative h-44 shrink-0 sm:h-full sm:w-2/5">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={data}
                  dataKey="value"
                  innerRadius="62%"
                  nameKey="name"
                  outerRadius="92%"
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      key={entry.name}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltipUsd} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground">Tổng</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatUsd(total)}
              </span>
            </div>
          </div>
          <ul className="min-w-0 flex-1 space-y-2 text-sm">
            {data.map((entry, index) => (
              <li className="flex items-center gap-2" key={entry.name}>
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2.5 shrink-0 rounded-sm",
                    LEGEND_SWATCH_CLASSNAMES[
                      index % LEGEND_SWATCH_CLASSNAMES.length
                    ]
                  )}
                />
                <span className="min-w-0 flex-1 leading-tight">
                  {entry.name}
                </span>
                <span className="font-medium tabular-nums">
                  {formatUsd(entry.value)}
                </span>
                <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                  {total > 0
                    ? `${((entry.value / total) * 100).toFixed(1)}%`
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </ChartCardShell>
  )
}

export function BreakdownBarCard({
  breakdownGroupBy,
  onBreakdownGroupByChange,
  query,
}: {
  breakdownGroupBy: OverviewBreakdownGroupBy
  onBreakdownGroupByChange: (value: OverviewBreakdownGroupBy) => void
  query: UseQueryResult<UsageLogSummary>
}) {
  const data = useMemo(
    () =>
      (query.data?.buckets ?? []).map((bucket) => ({
        cost: bucket.pricedCostUsd,
        name: bucket.key,
      })),
    [query.data]
  )

  return (
    <ChartCardShell
      headerAction={
        <Select
          onValueChange={(value) =>
            onBreakdownGroupByChange(value as OverviewBreakdownGroupBy)
          }
          value={breakdownGroupBy}
        >
          <SelectTrigger aria-label="Nhóm theo" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="provider">Nhà cung cấp</SelectItem>
            <SelectItem value="model">Mô hình</SelectItem>
          </SelectContent>
        </Select>
      }
      title="Chi phí theo nhà cung cấp/mô hình"
    >
      <QueryState isEmpty={data.length === 0} query={query} />
      {!query.isPending && !query.isError && data.length > 0 ? (
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis
              fontSize={12}
              tickFormatter={(value: number) => formatUsd(value)}
            />
            <Tooltip formatter={formatTooltipUsd} />
            <Bar
              dataKey="cost"
              fill="var(--color-chart-1)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : null}
    </ChartCardShell>
  )
}

export function DailyLineCard({
  query,
}: {
  query: UseQueryResult<UsageLogSummary>
}) {
  const data = useMemo(
    () =>
      fillDailyBuckets(
        (query.data?.buckets ?? []).map((bucket) => ({
          cost: bucket.pricedCostUsd,
          day: bucket.key,
        }))
      ),
    [query.data]
  )

  return (
    <ChartCardShell title="Chi phí theo ngày">
      <QueryState isEmpty={data.length === 0} query={query} />
      {!query.isPending && !query.isError && data.length > 0 ? (
        <ResponsiveContainer height="100%" width="100%">
          {/* Bars, not a smoothed line: days are discrete totals and a
              monotone curve invents dips and peaks between them. */}
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              fontSize={12}
              minTickGap={12}
              tickFormatter={formatDayTick}
            />
            <YAxis
              fontSize={12}
              tickFormatter={(value: number) => formatUsd(value)}
            />
            <Tooltip
              formatter={formatTooltipUsd}
              labelFormatter={(label) => formatDayTick(String(label))}
            />
            <Bar
              dataKey="cost"
              fill="var(--color-chart-2)"
              name="Chi phí"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : null}
    </ChartCardShell>
  )
}
