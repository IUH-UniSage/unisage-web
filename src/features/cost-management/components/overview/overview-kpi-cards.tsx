import {
  Coins,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  formatDelta,
  formatPercent,
  formatUsd,
} from "@/features/cost-management/utils/format-cost"

function budgetUsedColorClassName(percent: number | null): string {
  if (percent == null) return "text-foreground"
  if (percent > 80) return "text-destructive"
  if (percent >= 50) return "text-warning"
  return "text-success"
}

type OverviewKpiCardsProps = {
  budgetLimit: number | null
  budgetRemaining: number | null
  budgetUsedPercent: number | null
  monthOverMonthDeltaPercent: number | null
  thisMonthCost: number
  thisMonthUnpricedCost: number
}

export function OverviewKpiCards({
  budgetLimit,
  budgetRemaining,
  budgetUsedPercent,
  monthOverMonthDeltaPercent,
  thisMonthCost,
  thisMonthUnpricedCost,
}: OverviewKpiCardsProps) {
  const usedColor = budgetUsedColorClassName(budgetUsedPercent)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border bg-card shadow-none">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Chi phí tháng này
              </p>
              <p className="mt-2 text-2xl font-bold">
                {formatUsd(thisMonthCost)}
              </p>
            </div>
            <div className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <Coins aria-hidden="true" className="size-5" />
            </div>
          </div>
          <p
            className={cn(
              "mt-4 flex items-center gap-1 text-xs font-medium",
              monthOverMonthDeltaPercent == null
                ? "text-muted-foreground"
                : monthOverMonthDeltaPercent > 0
                  ? "text-destructive"
                  : "text-success"
            )}
          >
            {monthOverMonthDeltaPercent != null ? (
              monthOverMonthDeltaPercent > 0 ? (
                <TrendingUp aria-hidden="true" className="size-3.5" />
              ) : (
                <TrendingDown aria-hidden="true" className="size-3.5" />
              )
            ) : null}
            {monthOverMonthDeltaPercent != null
              ? `${formatDelta(monthOverMonthDeltaPercent)} so với tháng trước`
              : "Chưa có dữ liệu tháng trước"}
          </p>
        </CardContent>
      </Card>

      <Card className="border bg-card shadow-none">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Ngân sách tháng
              </p>
              <p className="mt-2 text-2xl font-bold">
                {budgetLimit != null ? formatUsd(budgetLimit) : "Chưa đặt"}
              </p>
            </div>
            <div className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <PiggyBank aria-hidden="true" className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Ngân sách hệ thống, chu kỳ hàng tháng
          </p>
        </CardContent>
      </Card>

      <Card className="border bg-card shadow-none">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                % ngân sách đã dùng
              </p>
              <p className={cn("mt-2 text-2xl font-bold", usedColor)}>
                {budgetUsedPercent != null
                  ? formatPercent(budgetUsedPercent)
                  : "-"}
              </p>
            </div>
            <div className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <Wallet aria-hidden="true" className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {budgetLimit == null
              ? "Chưa có ngân sách hệ thống để so sánh"
              : "Xanh dưới 50%, vàng 50-80%, đỏ trên 80%"}
          </p>
        </CardContent>
      </Card>

      <Card className="border bg-card shadow-none">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Còn lại
              </p>
              <p className="mt-2 text-2xl font-bold">
                {budgetRemaining != null ? formatUsd(budgetRemaining) : "-"}
              </p>
            </div>
            <div className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <Wallet aria-hidden="true" className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Ngân sách tháng trừ chi phí đã dùng
          </p>
        </CardContent>
      </Card>

      <Card className="border border-dashed bg-card shadow-none sm:col-span-2 xl:col-span-4">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Chưa định giá (ước tính)
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Các lệnh gọi chưa xác định được đơn giá - không tính vào chi phí
              thực tế ở trên
            </p>
          </div>
          <p className="text-xl font-bold text-muted-foreground">
            {formatUsd(thisMonthUnpricedCost)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
