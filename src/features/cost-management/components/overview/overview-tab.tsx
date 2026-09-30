import {
  BreakdownBarCard,
  DailyLineCard,
  DonutByPurposeCard,
} from "@/features/cost-management/components/overview/overview-charts"
import { OverviewFiltersBar } from "@/features/cost-management/components/overview/overview-filters"
import { OverviewKpiCards } from "@/features/cost-management/components/overview/overview-kpi-cards"
import { OverviewTopUsersTable } from "@/features/cost-management/components/overview/overview-top-users-table"
import { useOverviewTab } from "@/features/cost-management/hooks/use-overview-tab"

export function OverviewTab() {
  const overview = useOverviewTab()

  return (
    <div className="space-y-6">
      <h2 className="sr-only">Tổng quan chi phí AI</h2>

      <OverviewFiltersBar
        filters={overview.filters}
        onChange={overview.setFilters}
      />

      <OverviewKpiCards
        budgetLimit={overview.budgetLimit}
        budgetRemaining={overview.budgetRemaining}
        budgetUsedPercent={overview.budgetUsedPercent}
        monthOverMonthDeltaPercent={overview.monthOverMonthDeltaPercent}
        thisMonthCost={overview.thisMonthCost}
        thisMonthUnpricedCost={overview.thisMonthUnpricedCost}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <DonutByPurposeCard query={overview.purposeQuery} />
        <BreakdownBarCard
          breakdownGroupBy={overview.breakdownGroupBy}
          onBreakdownGroupByChange={overview.setBreakdownGroupBy}
          query={overview.breakdownQuery}
        />
      </div>

      <DailyLineCard query={overview.dayQuery} />

      <OverviewTopUsersTable query={overview.topUsersQuery} />
    </div>
  )
}
