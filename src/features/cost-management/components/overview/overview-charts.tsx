import { useMemo } from "react"
import type { ReactNode } from "react"
import type { UseQueryResult } from "@tanstack/react-query"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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
import { getUsagePurposeLabelByKey } from "@/features/cost-management/utils/purpose-labels"
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

  return (
    <ChartCardShell title="Chi phí theo mục đích">
      <QueryState isEmpty={data.length === 0} query={query} />
      {!query.isPending && !query.isError && data.length > 0 ? (
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              data={data}
              dataKey="value"
              innerRadius={55}
              nameKey="name"
              outerRadius={85}
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
            <Legend />
          </PieChart>
        </ResponsiveContainer>
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
      (query.data?.buckets ?? []).map((bucket) => ({
        cost: bucket.pricedCostUsd,
        day: bucket.key,
      })),
    [query.data]
  )

  return (
    <ChartCardShell title="Chi phí theo ngày">
      <QueryState isEmpty={data.length === 0} query={query} />
      {!query.isPending && !query.isError && data.length > 0 ? (
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" fontSize={12} />
            <YAxis
              fontSize={12}
              tickFormatter={(value: number) => formatUsd(value)}
            />
            <Tooltip formatter={formatTooltipUsd} />
            <Line
              dataKey="cost"
              dot={false}
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : null}
    </ChartCardShell>
  )
}
