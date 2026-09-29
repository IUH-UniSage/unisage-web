import { AlertTriangle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { useDismissBudgetAlertMutation } from "@/features/cost-management/queries/use-mutations"
import { useActiveBudgetAlertsQuery } from "@/features/cost-management/queries/use-queries"
import type { BudgetAlertLog } from "@/features/cost-management/schemas/cost-management-schemas"
import { formatUsd } from "@/features/cost-management/utils/format-cost"

function describeAlert(alert: BudgetAlertLog): string {
  if (alert.alertType === "SPIKE") {
    return `Chi phí hôm nay tăng đột biến - đã dùng ${formatUsd(alert.spentUsd)}.`
  }

  const limit = alert.limitUsd != null ? formatUsd(alert.limitUsd) : "?"
  return `Đã dùng ${formatUsd(alert.spentUsd)} / ${limit} (ngưỡng ${alert.thresholdPercent}%).`
}

// Polled every 60s (see costManagementOptions.activeAlerts) so a new alert
// or another admin's dismiss shows up without a manual refresh.
export function BudgetAlertBanner() {
  const { canRead } = useResourcePermissions("budget_alert")
  const { can } = usePermissions()
  const canDismiss = can("BUDGET_ALERT_DISMISS")
  const activeAlertsQuery = useActiveBudgetAlertsQuery()
  const dismissAlert = useDismissBudgetAlertMutation()

  if (!canRead) return null

  const alerts = activeAlertsQuery.data ?? []
  if (alerts.length === 0) return null

  return (
    <div className="mx-auto mb-4 w-full max-w-[1440px] space-y-2">
      {alerts.map((alert) => (
        <div
          className="flex items-start gap-3 rounded-xl border border-transparent bg-warning px-4 py-3 text-sm text-warning-foreground"
          key={alert.id}
          role="status"
        >
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          />
          <p className="min-w-0 flex-1">{describeAlert(alert)}</p>
          {canDismiss ? (
            <Button
              aria-label="Tắt cảnh báo"
              disabled={dismissAlert.isPending}
              onClick={() => dismissAlert.mutate(alert.id)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
