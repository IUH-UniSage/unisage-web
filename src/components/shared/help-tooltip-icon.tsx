import { CircleHelp } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type HelpTooltipIconProps = {
  className?: string
  content: string
  iconClassName?: string
}

export function HelpTooltipIcon({
  className,
  content,
  iconClassName,
}: HelpTooltipIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label="Thông tin thêm"
          className={cn(
            "inline-flex cursor-help items-center justify-center",
            className
          )}
          type="button"
        >
          <CircleHelp
            aria-hidden="true"
            className={cn("size-4 text-muted-foreground", iconClassName)}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-52 text-xs leading-5">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
