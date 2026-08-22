import { cn } from "@/lib/utils"

type ProgressBarProps = {
  className?: string
  value: number
}

export function ProgressBar({ className, value }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div
      aria-label={`${clampedValue}% complete`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={clampedValue}
      className={cn("h-1.5 overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}
