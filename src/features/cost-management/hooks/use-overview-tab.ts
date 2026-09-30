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

// Local calendar date - toISOString() would shift local midnight to the
// previous day in UTC+7.
function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
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

// The API range is [from, to), so `to` is the local midnight after toDate.
function toRangeParams(fromDate: string, toDate: string) {
  const to = new Date(`${toDate}T00:00:00`)
  to.setDate(to.getDate() + 1)
  return {
    from: new Date(`${fromDate}T00:00:00`).toISOString(),
    to: to.toISOString(),
  }
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
  // The budget's own spend also counts unpriced estimates, same as enforcement,
  // so it can differ from the priced-only "this month" cost.
  const budgetSpent = systemMonthlyBudget?.spentUsd ?? thisMonthCost
  const budgetUsedPercent =
    systemMonthlyBudget?.spentPercent ??
    (budgetLimit && budgetLimit > 0 ? (budgetSpent / budgetLimit) * 100 : null)
  const budgetRemaining = budgetLimit != null ? budgetLimit - budgetSpent : null

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
