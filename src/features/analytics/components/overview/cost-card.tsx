import { ArrowRight } from "lucide-react"
import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/paths"
import { DeltaLine } from "@/features/analytics/components/overview/kpi-cards"
import type {
  BudgetUsage,
  DashboardSummary,
} from "@/features/analytics/schemas/dashboard-schemas"
import {
  formatBucketLabel,
  formatCount,
  formatRate,
  percentChange,
} from "@/features/analytics/utils/dashboard-format"
import { PermissionGate } from "@/features/auth/components/permission-gate"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
import {
  getBudgetPeriodLabel,
  getBudgetScopeLabel,
} from "@/features/cost-management/utils/budget-labels"
import { formatUsd } from "@/features/cost-management/utils/format-cost"
import { getUsagePurposeLabel } from "@/features/cost-management/utils/purpose-labels"
import { cn } from "@/lib/utils"

const COST_COLOR = "var(--color-chart-5)"
const BUDGET_WARNING_PERCENT = 80

export function CostCard({ summary }: { summary: DashboardSummary }) {
  const { activity, answers, cost, period } = summary
  const delta = percentChange(cost.totalUsd, cost.previousTotalUsd)
  const chatCost =
    cost.byPurpose.find((row) => row.purpose === "CHAT")?.costUsd ?? 0
  const answered = answers.current.total - answers.current.failed
  const trend = useMemo(
    () =>
      activity.map((bucket) => ({
        costUsd: bucket.costUsd,
        label: formatBucketLabel(bucket.start, period.granularity),
      })),
    [activity, period.granularity]
  )

  return (
    <Card className="flex flex-col border bg-card shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Chi phí AI</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Trong khoảng thời gian đã chọn
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5 p-5 md:p-6">
        <div>
          <p className="text-3xl font-bold tabular-nums">
            {formatUsd(cost.totalUsd)}
          </p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <DeltaLine
              delta={
                delta == null ? null : { higherIsBetter: false, value: delta }
              }
              neutral
            />
            <p>
              {formatCount(cost.requestCount)} lượt gọi model
              {answered > 0 && chatCost > 0
                ? ` · ${formatUsd(chatCost / answered)} mỗi câu trả lời`
                : ""}
            </p>
          </div>
        </div>

        {cost.requestCount > 0 ? (
          <div aria-hidden="true" className="h-16">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart
                data={trend}
                margin={{ bottom: 0, left: 0, right: 0, top: 4 }}
              >
                <Tooltip
                  content={<CostTooltip />}
                  cursor={{ stroke: "var(--color-border)" }}
                />
                <Area
                  dataKey="costUsd"
                  fill={COST_COLOR}
                  fillOpacity={0.15}
                  stroke={COST_COLOR}
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Chưa có lượt gọi model nào trong khoảng này.
          </p>
        )}

        {cost.unpricedEstimateUsd > 0 ? (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Thêm khoảng {formatUsd(cost.unpricedEstimateUsd)} từ model chưa có
            giá, chưa tính vào tổng.
          </p>
        ) : null}

        {cost.byPurpose.length > 0 ? (
          <section
            aria-label="Chi phí theo mục đích sử dụng"
            className="space-y-3"
          >
            <h3 className="text-xs font-medium text-muted-foreground">
              Theo mục đích sử dụng
            </h3>
            {cost.byPurpose.map((row) => {
              const share =
                cost.totalUsd > 0 ? (row.costUsd / cost.totalUsd) * 100 : 0
              return (
                <Meter
                  key={row.purpose}
                  label={getUsagePurposeLabel(row.purpose)}
                  percent={share}
                  value={`${formatUsd(row.costUsd)} · ${formatRate(share)}`}
                />
              )
            })}
          </section>
        ) : null}

        {cost.budgets.length > 0 ? (
          <section aria-label="Ngân sách" className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground">
              Ngân sách dùng nhiều nhất · theo kỳ riêng của từng ngân sách
            </h3>
            {cost.budgets.map((budget) => (
              <Meter
                key={budget.id}
                label={describeBudget(budget)}
                percent={budget.spentPercent}
                tone={budgetTone(budget.spentPercent)}
                value={`${formatUsd(budget.spentUsd)} / ${formatUsd(budget.limitUsd)} · ${formatRate(budget.spentPercent)}`}
              />
            ))}
          </section>
        ) : null}

        <PermissionGate
          requiredPermissions={PERMISSION_POLICIES.costManagement}
        >
          <Button asChild className="mt-auto w-full" variant="outline">
            <Link to={ROUTES.adminCostManagement}>
              Mở quản lý chi phí
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </PermissionGate>
      </CardContent>
    </Card>
  )
}

function describeBudget(budget: BudgetUsage): string {
  const target =
    budget.scope === "PROVIDER"
      ? budget.scopeProvider
      : budget.scope === "PURPOSE" && budget.scopePurpose
        ? getUsagePurposeLabel(budget.scopePurpose)
        : null
  const scope = target
    ? `${getBudgetScopeLabel(budget.scope)} ${target}`
    : getBudgetScopeLabel(budget.scope)
  return `${scope} · ${getBudgetPeriodLabel(budget.period)}`
}

type MeterTone = "normal" | "warning" | "critical"

function budgetTone(percent: number): MeterTone {
  if (percent >= 100) return "critical"
  if (percent >= BUDGET_WARNING_PERCENT) return "warning"
  return "normal"
}

const METER_FILL: Record<MeterTone, string> = {
  critical: "bg-destructive",
  normal: "bg-chart-2",
  // No saturated warning token exists; amber reads as "near the limit" in both themes.
  warning: "bg-amber-500",
}

function Meter({
  label,
  percent,
  tone = "normal",
  value,
}: {
  label: string
  percent: number
  tone?: MeterTone
  value: string
}) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="truncate font-medium">{label}</span>
        <span className="shrink-0 text-muted-foreground tabular-nums">
          {value}
        </span>
      </div>
      <div
        aria-label={`${label}: ${value}`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(clamped)}
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
        role="meter"
      >
        <div
          className={cn("h-full rounded-full", METER_FILL[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

type CostTooltipPayload = { payload?: { costUsd: number; label: string } }

function CostTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: readonly CostTooltipPayload[]
}) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="font-semibold">{row.label}</p>
      <p className="mt-1 tabular-nums">{formatUsd(row.costUsd)}</p>
    </div>
  )
}
