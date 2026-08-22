import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const label = isDark
    ? "Chuyển sang giao diện sáng"
    : "Chuyển sang giao diện tối"

  return (
    <Button
      aria-label={label}
      className={cn("rounded-full", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size="icon"
      title={label}
      type="button"
      variant="ghost"
    >
      <Sun aria-hidden="true" className="hidden size-4 dark:block" />
      <Moon aria-hidden="true" className="size-4 dark:hidden" />
    </Button>
  )
}
