import { Card, CardContent } from "@/components/ui/card"
import {
  COMPONENT_ICONS,
  FALLBACK_COMPONENT_ICON,
} from "@/features/system-health/components/component-icons"
import { HealthStatusBadge } from "@/features/system-health/components/health-status-badge"
import { cn } from "@/lib/utils"
import {
  getAgentSubComponents,
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
  const subComponents = getAgentSubComponents(health.details)

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
            {subComponents ? (
              <ul className="mt-1.5 space-y-0.5">
                {subComponents.map((sub) => (
                  <li
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    key={sub.key}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        sub.up ? "bg-success" : "bg-destructive"
                      )}
                    />
                    <span>{sub.label}</span>
                    {typeof sub.responseTimeMs === "number" ? (
                      <span>· {sub.responseTimeMs}ms</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <HealthStatusBadge status={health.status} />
      </CardContent>
    </Card>
  )
}
