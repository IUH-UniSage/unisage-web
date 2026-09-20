import { Check, Copy } from "lucide-react"
import { useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type CopyableIdProps = {
  className?: string
  value: string
}

/**
 * Renders a full id/UUID value (never truncated) that copies itself to the
 * clipboard on click, with brief visual feedback - mirrors the
 * handleCopyEndpoint pattern in chat-model-list.tsx so every id in the app
 * behaves the same way.
 */
export function CopyableId({ className, value }: CopyableIdProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore - clipboard may be unavailable (non-secure context, etc.)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            "inline-flex max-w-full cursor-pointer items-center gap-1 rounded-sm font-mono text-xs break-all text-muted-foreground transition-colors hover:text-foreground",
            className
          )}
          onClick={handleCopy}
          type="button"
        >
          <span className="text-left break-all">{value}</span>
          {copied ? (
            <Check className="size-3 shrink-0 text-emerald-500" />
          ) : (
            <Copy className="size-3 shrink-0 opacity-60" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Đã sao chép" : "Sao chép"}</TooltipContent>
    </Tooltip>
  )
}
