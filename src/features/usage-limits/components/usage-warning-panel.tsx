import { AlertTriangle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useMyUsageQuery } from "@/features/usage-limits/queries/use-queries"
import type { UsageWindow } from "@/features/usage-limits/schemas/usage-limit-schemas"
import {
  formatTimeUntil,
  isRunningLow,
} from "@/features/usage-limits/utils/usage-format"

type UsageWarningPanelProps = {
  onDismiss: () => void
}

function describeWindow(label: string, window: UsageWindow) {
  const used = 100 - (window.remainingPercent ?? 0)
  const untilReset = window.resetAt ? formatTimeUntil(window.resetAt) : null

  return `Đã dùng ${used}% hạn mức ${label}${
    untilReset ? `, làm mới sau ${untilReset}` : ""
  }.`
}

// Shown above the chat box once 80% or more of a window is used. The parent owns "dismissed".
export function UsageWarningPanel({ onDismiss }: UsageWarningPanelProps) {
  const usageQuery = useMyUsageQuery()
  const usage = usageQuery.data
  if (!usage) return null

  const lines = [
    isRunningLow(usage.daily) ? describeWindow("24 giờ", usage.daily) : null,
    isRunningLow(usage.weekly) ? describeWindow("7 ngày", usage.weekly) : null,
  ].filter((line): line is string => line !== null)

  if (!lines.length) return null

  return (
    <div
      className="mx-auto mb-2 flex w-full max-w-3xl items-start gap-3 rounded-xl border border-transparent bg-warning px-4 py-3 text-sm text-warning-foreground"
      role="status"
    >
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-medium">Sắp hết hạn mức sử dụng</p>
        {lines.map((line) => (
          <p className="text-warning-foreground/80" key={line}>
            {line}
          </p>
        ))}
      </div>
      <Button
        aria-label="Đóng cảnh báo"
        onClick={onDismiss}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <X aria-hidden="true" />
      </Button>
    </div>
  )
}
