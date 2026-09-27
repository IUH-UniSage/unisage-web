import { Card, CardContent } from "@/components/ui/card"
import {
  COMPONENT_ICONS,
  FALLBACK_COMPONENT_ICON,
} from "@/features/system-health/components/component-icons"
import { HealthStatusBadge } from "@/features/system-health/components/health-status-badge"
import { cn } from "@/lib/utils"
import {
  getComponentDescription,
  getComponentFacts,
  getComponentLabel,
  getHealthStatusDotClassName,
  HEALTH_STATUS_LABELS,
  type ComponentHealth,
  type KnownComponentKey,
} from "@/features/system-health/schemas/system-health-schemas"

type ComponentHealthCardProps = {
  componentKey: string
  health: ComponentHealth
}

// Compact layout: icon, name and status share one row and every card ends
// with the same two-row detail box - no per-card "Cập nhật lúc" footer, the overall
// banner above already shows the same check time (UNISAGE-93).
export function ComponentHealthCard({
  componentKey,
  health,
}: ComponentHealthCardProps) {
  const Icon =
    COMPONENT_ICONS[componentKey as KnownComponentKey] ??
    FALLBACK_COMPONENT_ICON
  const description = getComponentDescription(componentKey)
  const facts = getComponentFacts(health, componentKey)

  return (
    <Card className="h-full" size="sm">
      <CardContent className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
          </div>
          <p className="min-w-0 flex-1 truncate font-medium">
            {getComponentLabel(componentKey)}
          </p>
          {health.status === "UP" ? (
            // Healthy is the normal case - a dot is enough; spelling out
            // "Hoạt động tốt" on every card only truncated the names.
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                getHealthStatusDotClassName(health.status)
              )}
              role="img"
              aria-label={HEALTH_STATUS_LABELS[health.status]}
              title={HEALTH_STATUS_LABELS[health.status]}
            />
          ) : (
            <HealthStatusBadge className="shrink-0" status={health.status} />
          )}
        </div>

        {description ? (
          // One line on every card so the detail boxes below line up; the
          // full sentence is on hover.
          <p
            className="truncate text-xs text-muted-foreground"
            title={description}
          >
            {description}
          </p>
        ) : null}

        <dl className="space-y-1 rounded-lg bg-muted/50 px-2.5 py-2 text-xs">
          {facts.map((fact) => (
            <div className="flex items-baseline gap-2" key={fact.label}>
              <dt className="shrink-0 text-muted-foreground">{fact.label}</dt>
              <dd
                className="min-w-0 flex-1 truncate text-right font-medium tabular-nums"
                title={fact.title ?? fact.value}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
