import type { ButtonHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode
  iconSize?: "lg" | "md" | "sm"
  size?: "lg" | "md" | "sm"
  variant?: "default" | "destructive"
}

export function ActionButton({
  className,
  icon,
  iconSize = "md",
  size = "md",
  variant = "default",
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full transition-colors",
        "bg-muted hover:bg-muted/70 [&>svg]:stroke-[1.5]",
        variant === "destructive" && "text-destructive hover:bg-destructive/10",
        size === "sm" && "size-7",
        size === "md" && "size-8",
        size === "lg" && "size-10",
        iconSize === "sm" && "[&>svg]:size-3.5",
        iconSize === "md" && "[&>svg]:size-4",
        iconSize === "lg" && "[&>svg]:size-5",
        className
      )}
      type="button"
      {...props}
    >
      {icon}
    </button>
  )
}
