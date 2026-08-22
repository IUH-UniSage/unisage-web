import unisageAvatarUrl from "@/assets/unisage-avatar.svg"
import { cn } from "@/lib/utils"

type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <img
      aria-hidden="true"
      alt=""
      className={cn("size-9 shrink-0", className)}
      src={unisageAvatarUrl}
    />
  )
}
