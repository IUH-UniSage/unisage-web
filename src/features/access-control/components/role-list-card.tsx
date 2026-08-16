import { Check, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getRoleLabel } from "@/features/access-control/lib/access-control-formatters"
import type { AccessRole } from "@/features/access-control/schemas/access-control-schemas"
import { cn } from "@/lib/utils"

type RoleListCardProps = {
  onSelectRole: (role: AccessRole) => void
  roles: AccessRole[]
  selectedRole: AccessRole | undefined
}

export function RoleListCard({
  onSelectRole,
  roles,
  selectedRole,
}: RoleListCardProps) {
  return (
    <Card className="border bg-card shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Vai trò hệ thống</CardTitle>
        <CardDescription>
          Chọn vai trò để xem và điều chỉnh quyền.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {roles.map((role) => {
          const isSelected = role.id === selectedRole?.id

          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:ring-3 focus-visible:ring-primary/15 focus-visible:outline-none",
                isSelected
                  ? "border-primary/35 bg-secondary"
                  : "bg-background/50 hover:border-primary/20 hover:bg-secondary/45"
              )}
              key={role.id}
              onClick={() => onSelectRole(role)}
              type="button"
            >
              <span
                className={cn(
                  "mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-primary"
                )}
              >
                <ShieldCheck aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {getRoleLabel(role.name)}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {role.permissions.length} quyền được cấp
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {role.isSystemRole ? (
                    <Badge variant="outline">Hệ thống</Badge>
                  ) : (
                    <Badge variant="secondary">Tùy chỉnh</Badge>
                  )}
                  {!role.isActive ? (
                    <Badge variant="destructive">Đã khóa</Badge>
                  ) : null}
                </span>
              </span>
              {isSelected ? (
                <Check
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-primary"
                />
              ) : null}
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
