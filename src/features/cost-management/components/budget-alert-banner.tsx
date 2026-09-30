import { AlertTriangle, ArrowRight, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/paths"
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

const AUTO_HIDE_MS = 3_000
const HIDDEN_STORAGE_KEY = "budget-alert-banner:hidden"

// Auto-hiding is per browser session only - the alert stays active (and in the
// Alerts tab history) until someone dismisses it with the X button.
function readHiddenIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(HIDDEN_STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function writeHiddenIds(ids: Set<string>) {
  try {
    sessionStorage.setItem(HIDDEN_STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // Storage unavailable (private mode): banners just reappear next session.
  }
}

// Polled every 60s (see costManagementOptions.activeAlerts) so a new alert
// or another admin's dismiss shows up without a manual refresh.
export function BudgetAlertBanner() {
  const { canRead } = useResourcePermissions("budget_alert")
  const { can } = usePermissions()
  const canDismiss = can("BUDGET_ALERT_DISMISS")
  const activeAlertsQuery = useActiveBudgetAlertsQuery()
  const dismissAlert = useDismissBudgetAlertMutation()
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(readHiddenIds)

  const alerts = (activeAlertsQuery.data ?? []).filter(
    (alert) => !hiddenIds.has(alert.id)
  )
  const visibleKey = alerts.map((alert) => alert.id).join(",")

  useEffect(() => {
    if (!visibleKey) return
    const timer = window.setTimeout(() => {
      setHiddenIds((previous) => {
        const next = new Set(previous)
        visibleKey.split(",").forEach((id) => next.add(id))
        writeHiddenIds(next)
        return next
      })
    }, AUTO_HIDE_MS)
    return () => window.clearTimeout(timer)
  }, [visibleKey])

  if (!canRead || alerts.length === 0) return null

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
          <Button asChild size="sm" type="button" variant="ghost">
            <Link to={`${ROUTES.adminCostManagement}?tab=alerts`}>
              Xem chi tiết
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
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
