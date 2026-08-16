import type { LucideIcon } from "lucide-react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type SearchAction = {
  icon: LucideIcon
  id: string
  label: string
  onClick: () => void
}

type SearchAndActionsProps = {
  actions?: SearchAction[]
  className?: string
  inputClassName?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  placeholder?: string
  value?: string
}

export function SearchAndActions({
  actions = [],
  className,
  inputClassName,
  onChange,
  onFocus,
  placeholder = "Tìm kiếm...",
  value,
}: SearchAndActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="group relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
        />
        <Input
          aria-label={placeholder}
          className={cn("h-10 bg-muted/60 pl-9", inputClassName)}
          onChange={(event) => onChange?.(event.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          value={value}
        />
      </div>
      {actions.length ? (
        <div className="flex shrink-0 items-center gap-1">
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <Button
                aria-label={action.label}
                key={action.id}
                onClick={(event) => {
                  event.stopPropagation()
                  action.onClick()
                }}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Icon aria-hidden="true" />
              </Button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
