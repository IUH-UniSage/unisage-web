import { Card, CardContent } from "@/components/ui/card"
import {
  COMPONENT_ICONS,
  FALLBACK_COMPONENT_ICON,
} from "@/features/system-health/components/component-icons"
import { HealthStatusBadge } from "@/features/system-health/components/health-status-badge"
import {
  getComponentDescription,
  getComponentLabel,
  type ComponentHealth,
  type KnownComponentKey,
} from "@/features/system-health/schemas/system-health-schemas"
import { formatDateTime } from "@/utils/date"

type ComponentHealthCardProps = {
  checkedAt: string
  componentKey: string
  health: ComponentHealth
}

export function ComponentHealthCard({
  checkedAt,
  componentKey,
  health,
}: ComponentHealthCardProps) {
  const Icon =
    COMPONENT_ICONS[componentKey as KnownComponentKey] ??
    FALLBACK_COMPONENT_ICON

  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon
              aria-hidden="true"
              className="size-4.5 text-muted-foreground"
            />
          </div>
          <div>
            <p className="font-medium">{getComponentLabel(componentKey)}</p>
            {getComponentDescription(componentKey) ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {getComponentDescription(componentKey)}
              </p>
            ) : null}
            <p className="mt-0.5 text-xs text-muted-foreground">
              Cập nhật lúc {formatDateTime(checkedAt)}
              {typeof health.responseTimeMs === "number"
                ? ` · ${health.responseTimeMs}ms`
                : ""}
            </p>
          </div>
        </div>
        <HealthStatusBadge status={health.status} />
      </CardContent>
    </Card>
  )
}
