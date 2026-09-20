import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

import { HealthStatusBadge } from "@/features/system-health/components/health-status-badge"
import { type HealthStatus } from "@/features/system-health/schemas/system-health-schemas"
import { formatDateTime } from "@/utils/date"
import { cn } from "@/lib/utils"

type OverallStatusBannerProps = {
  checkedAt: string
  status: HealthStatus
}

const BANNER_CLASSNAME: Record<HealthStatus, string> = {
  DEGRADED: "border-warning-foreground/20 bg-warning/40",
  DOWN: "border-destructive/20 bg-destructive/8",
  OUT_OF_SERVICE: "border-border bg-muted/50",
  UP: "border-success/20 bg-success/8",
}

const BANNER_ICON: Record<HealthStatus, typeof CheckCircle2> = {
  DEGRADED: AlertTriangle,
  DOWN: XCircle,
  OUT_OF_SERVICE: XCircle,
  UP: CheckCircle2,
}

export function OverallStatusBanner({
  checkedAt,
  status,
}: OverallStatusBannerProps) {
  const Icon = BANNER_ICON[status]

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4",
        BANNER_CLASSNAME[status]
      )}
    >
      <div className="flex items-center gap-3">
        <Icon aria-hidden="true" className="size-5" />
        <div>
          <p className="font-semibold">Tình trạng tổng thể hệ thống</p>
          <p className="text-xs text-muted-foreground">
            Kiểm tra lần cuối lúc {formatDateTime(checkedAt)}
          </p>
        </div>
      </div>
      <HealthStatusBadge status={status} />
    </div>
  )
}
