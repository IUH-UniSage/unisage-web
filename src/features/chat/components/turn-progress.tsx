import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

import type { TurnProgress } from "@/features/chat/hooks/use-turn-progress"
import {
  formatElapsed,
  progressLabel,
} from "@/features/chat/utils/turn-progress"
import { cn } from "@/lib/utils"

const TICK_MS = 100

/** Time since `startedAt`, counting up every tenth of a second: "3,2s". */
export function ElapsedTime({
  className,
  startedAt,
}: {
  className?: string
  startedAt: number
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <span className={cn("tabular-nums", className)}>
      {formatElapsed(now - startedAt)}
    </span>
  )
}

/** What the in-flight turn is doing ("Đang tìm thông tin") and for how long,
 * shown in the assistant bubble until the answer starts streaming in. */
export function TurnProgressIndicator({
  progress,
}: {
  progress: TurnProgress
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 py-1 text-sm text-muted-foreground">
      <Loader2 aria-hidden className="size-3.5 shrink-0 animate-spin" />
      <span aria-live="polite" className="min-w-0 truncate" role="status">
        {progressLabel(progress.status)}
      </span>
      <span aria-hidden className="shrink-0">
        ·
      </span>
      {/* Ticks ten times a second: kept out of the live region. */}
      <ElapsedTime className="shrink-0" startedAt={progress.startedAt} />
    </div>
  )
}
