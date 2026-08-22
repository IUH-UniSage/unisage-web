import { cn } from "@/lib/utils"

type ProgressBarProps = {
  className?: string
  value: number
}

function ProgressBar({ className, value }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
      className={cn("h-1.5 overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}

export { ProgressBar }
