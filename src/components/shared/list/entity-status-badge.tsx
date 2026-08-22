import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type AccessStatusBadgeProps = {
  isActive: boolean
}

export function AccessStatusBadge({ isActive }: AccessStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "gap-1.5 px-2.5",
        isActive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-destructive/10 text-destructive"
      )}
      variant="ghost"
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-destructive"
        )}
      />
      {isActive ? "Hoạt động" : "Vô hiệu hóa"}
    </Badge>
  )
}
