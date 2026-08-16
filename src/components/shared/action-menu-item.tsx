import type { ButtonHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

type ActionMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: "button" | "div"
  disabled?: boolean
  icon: ReactNode
  label: string
  labelRightElement?: ReactNode
  rightElement?: ReactNode
  showDivider?: boolean
  subLabel?: ReactNode
  variant?: "default" | "destructive"
}

export function ActionMenuItem({
  as = "button",
  className,
  disabled = false,
  icon,
  label,
  labelRightElement,
  rightElement,
  showDivider = false,
  subLabel,
  variant = "default",
  ...props
}: ActionMenuItemProps) {
  const content = (
    <>
      <span
        className={cn(
          "shrink-0 [&>svg]:size-5 [&>svg]:stroke-[1.8]",
          variant === "destructive" ? "text-destructive" : "text-primary"
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "flex items-center gap-1.5 truncate",
            variant === "destructive" && "text-destructive"
          )}
        >
          {label}
          {labelRightElement}
        </span>
        {subLabel ? (
          <span className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
            {subLabel}
          </span>
        ) : null}
      </span>
      {rightElement ? (
        <span className="flex shrink-0 items-center justify-center text-muted-foreground">
          {rightElement}
        </span>
      ) : null}
    </>
  )

  return (
    <div className={cn("w-full", disabled && "pointer-events-none opacity-50")}>
      {showDivider ? <div className="mr-4 ml-12 h-px bg-border/60" /> : null}
      {as === "button" ? (
        <button
          className={cn(
            "group flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/60",
            className
          )}
          disabled={disabled}
          type="button"
          {...props}
        >
          {content}
        </button>
      ) : (
        <div className={cn("flex items-center gap-3 px-4 py-2.5", className)}>
          {content}
        </div>
      )}
    </div>
  )
}
