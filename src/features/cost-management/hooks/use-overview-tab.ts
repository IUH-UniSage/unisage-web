import { useMemo, useState } from "react"

import {
  useBudgetsQuery,
  useUsageLogSummaryQuery,
} from "@/features/cost-management/queries/use-queries"
import type { UsagePurpose } from "@/features/cost-management/schemas/cost-management-schemas"

export type OverviewFilters = {
  fromDate: string
  toDate: string
  provider?: string
  purpose?: UsagePurpose
}

export type OverviewBreakdownGroupBy = "provider" | "model"

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function firstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function firstDayOfPreviousMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1)
}

function lastDayOfPreviousMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 0)
}

export function defaultOverviewFilters(): OverviewFilters {
  const now = new Date()
  return { fromDate: toIsoDate(firstDayOfMonth(now)), toDate: toIsoDate(now) }
}

function toRangeParams(fromDate: string, toDate: string) {
  return { from: `${fromDate}T00:00:00Z`, to: `${toDate}T23:59:59Z` }
}

function sumCosts(
  buckets:
    { estimatedUnpricedCostUsd: number; pricedCostUsd: number }[] | undefined
) {
  return {
    priced: buckets?.reduce((total, b) => total + b.pricedCostUsd, 0) ?? 0,
    unpriced:
      buckets?.reduce((total, b) => total + b.estimatedUnpricedCostUsd, 0) ?? 0,
  }
}

export function useOverviewTab() {
  const [filters, setFilters] = useState<OverviewFilters>(
    defaultOverviewFilters
  )
  const [breakdownGroupBy, setBreakdownGroupBy] =
    useState<OverviewBreakdownGroupBy>("provider")

  // Kept stable across re-renders so month-boundary queries don't refetch
  // every render just because `new Date()` is a fresh object each time.
  const [now] = useState(() => new Date())

  const thisMonthRange = useMemo(
    () => toRangeParams(toIsoDate(firstDayOfMonth(now)), toIsoDate(now)),
    [now]
  )
  const lastMonthRange = useMemo(
    () =>
      toRangeParams(
        toIsoDate(firstDayOfPreviousMonth(now)),
        toIsoDate(lastDayOfPreviousMonth(now))
      ),
    [now]
  )
  const filterRange = useMemo(
    () => toRangeParams(filters.fromDate, filters.toDate),
    [filters.fromDate, filters.toDate]
  )

  const thisMonthQuery = useUsageLogSummaryQuery({
    ...thisMonthRange,
    groupBy: "purpose",
  })
  const lastMonthQuery = useUsageLogSummaryQuery({
    ...lastMonthRange,
    groupBy: "purpose",
  })
  const budgetsQuery = useBudgetsQuery()

  const purposeQuery = useUsageLogSummaryQuery({
    ...filterRange,
    groupBy: "purpose",
    provider: filters.provider,
    purpose: filters.purpose,
  })
  const breakdownQuery = useUsageLogSummaryQuery({
    ...filterRange,
    groupBy: breakdownGroupBy,
    provider: filters.provider,
    purpose: filters.purpose,
  })
  const dayQuery = useUsageLogSummaryQuery({
    ...filterRange,
    groupBy: "day",
    provider: filters.provider,
    purpose: filters.purpose,
  })
  const topUsersQuery = useUsageLogSummaryQuery({
    ...filterRange,
    groupBy: "user",
    provider: filters.provider,
    purpose: filters.purpose,
  })

  const thisMonthTotals = sumCosts(thisMonthQuery.data?.buckets)
  const lastMonthTotals = sumCosts(lastMonthQuery.data?.buckets)
  const thisMonthCost = thisMonthTotals.priced
  const lastMonthCost = lastMonthTotals.priced
  const monthOverMonthDeltaPercent =
    lastMonthCost > 0
      ? ((thisMonthCost - lastMonthCost) / lastMonthCost) * 100
      : null

  const systemMonthlyBudget = budgetsQuery.data?.find(
    (budget) => budget.scope === "SYSTEM" && budget.period === "MONTHLY"
  )
  const budgetLimit = systemMonthlyBudget?.limitUsd ?? null
  const budgetUsedPercent =
    budgetLimit && budgetLimit > 0 ? (thisMonthCost / budgetLimit) * 100 : null
  const budgetRemaining =
    budgetLimit != null ? budgetLimit - thisMonthCost : null

  return {
    breakdownGroupBy,
    breakdownQuery,
    budgetLimit,
    budgetRemaining,
    budgetUsedPercent,
    budgetsQuery,
    dayQuery,
    filters,
    monthOverMonthDeltaPercent,
    purposeQuery,
    setBreakdownGroupBy,
    setFilters,
    thisMonthCost,
    thisMonthQuery,
    thisMonthUnpricedCost: thisMonthTotals.unpriced,
    topUsersQuery,
  }
}
