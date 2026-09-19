import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function ProfileInfoItem({
  icon: Icon,
  label,
  mono,
  value,
}: {
  icon: LucideIcon
  label: string
  mono?: boolean
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
      <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
        <Icon aria-hidden="true" className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "block truncate text-sm font-semibold text-foreground",
            mono && "font-mono"
          )}
        >
          {value}
        </span>
      </div>
    </div>
  )
}
