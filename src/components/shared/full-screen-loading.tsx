import { LoaderCircle } from "lucide-react"

import { BrandMark } from "@/components/shared/brand/brand-mark"
import { cn } from "@/lib/utils"

type FullScreenLoadingProps = {
  className?: string
  message?: string
}

export function FullScreenLoading({
  className,
  message = "Đang tải không gian làm việc...",
}: FullScreenLoadingProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 grid place-items-center bg-background",
        className
      )}
      role="status"
    >
      <div className="flex flex-col items-center gap-4">
        <BrandMark className="size-12 animate-pulse" />
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin text-primary"
        />
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
