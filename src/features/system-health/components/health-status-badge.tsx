import { Badge } from "@/components/ui/badge"
import {
  getHealthStatusBadgeClassName,
  getHealthStatusDotClassName,
  HEALTH_STATUS_LABELS,
  type HealthStatus,
} from "@/features/system-health/schemas/system-health-schemas"
import { cn } from "@/lib/utils"

type HealthStatusBadgeProps = {
  className?: string
  status: HealthStatus
}

export function HealthStatusBadge({
  className,
  status,
}: HealthStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "gap-1.5 px-2.5",
        getHealthStatusBadgeClassName(status),
        className
      )}
      variant="ghost"
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          getHealthStatusDotClassName(status)
        )}
      />
      {HEALTH_STATUS_LABELS[status]}
    </Badge>
  )
}
