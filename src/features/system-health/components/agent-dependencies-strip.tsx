import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getAgentSubComponents } from "@/features/system-health/schemas/system-health-schemas"

type AgentDependenciesStripProps = {
  details: Record<string, unknown> | null | undefined
}

// Trợ lý AI's own PostgreSQL/Qdrant/Redis, one box each, below the component
// cards - listing them inside the agent card made it taller than the other
// three, hiding them behind a hover made them invisible (UNISAGE-93).
export function AgentDependenciesStrip({
  details,
}: AgentDependenciesStripProps) {
  const subComponents = getAgentSubComponents(details)
  if (!subComponents || subComponents.length === 0) return null

  return (
    <Card size="sm">
      <CardContent className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Thành phần bên trong Trợ lý AI
        </p>
        <ul className="grid gap-2 sm:grid-cols-3">
          {subComponents.map((sub) => (
            <li
              className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs"
              key={sub.key}
            >
              <span
                aria-label={sub.up ? "Hoạt động" : "Lỗi"}
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  sub.up ? "bg-success" : "bg-destructive"
                )}
                role="img"
              />
              <span className="min-w-0 flex-1 truncate font-medium">
                {sub.label}
              </span>
              <span
                className={cn(
                  "shrink-0 tabular-nums",
                  sub.up ? "text-muted-foreground" : "text-destructive"
                )}
              >
                {sub.up
                  ? sub.responseTimeMs !== null
                    ? `${sub.responseTimeMs}ms`
                    : "—"
                  : "Lỗi"}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
