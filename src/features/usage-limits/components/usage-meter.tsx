import { ProgressBar } from "@/components/ui/progress-bar"
import type { UsageWindow } from "@/features/usage-limits/schemas/usage-limit-schemas"
import {
  formatResetTime,
  formatTimeUntil,
  isRunningLow,
} from "@/features/usage-limits/utils/usage-format"
import { cn } from "@/lib/utils"

type UsageMeterProps = {
  label: string
  window: UsageWindow
}

// One usage window as a row: label and reset time on the left, the bar in the middle and the
// percentage used on the right. Never shows token counts.
export function UsageMeter({ label, window }: UsageMeterProps) {
  const isLow = isRunningLow(window)
  // The API reports what is left; the bar and label show what has been used, like Claude.
  const used = 100 - (window.remainingPercent ?? 100)
  const untilReset = window.resetAt ? formatTimeUntil(window.resetAt) : null

  const caption =
    window.status === "UNLIMITED"
      ? "Gói của bạn không giới hạn."
      : window.status === "ACTIVE" && untilReset
        ? `Làm mới sau ${untilReset}`
        : "Chưa bắt đầu tính. Hạn mức bắt đầu từ lượt hỏi kế tiếp."

  return (
    <div className="grid items-center gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,14rem)_1fr_5.5rem]">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p
          className="mt-0.5 text-xs text-muted-foreground"
          title={window.resetAt ? formatResetTime(window.resetAt) : undefined}
        >
          {caption}
        </p>
      </div>

      {window.status === "UNLIMITED" ? (
        // No bar to draw: the text takes the bar and percentage columns so it stays on one line.
        <p className="text-sm font-semibold whitespace-nowrap text-muted-foreground sm:col-span-2 sm:text-right">
          Không giới hạn
        </p>
      ) : (
        <>
          <ProgressBar
            className={cn("h-2.5", isLow && "[&>div]:bg-destructive")}
            value={used}
          />
          <p
            className={cn(
              "text-sm font-semibold sm:text-right",
              isLow ? "text-destructive" : "text-foreground"
            )}
          >
            {used}% đã dùng
          </p>
        </>
      )}
    </div>
  )
}
