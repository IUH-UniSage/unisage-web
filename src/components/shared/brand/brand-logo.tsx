import { BrandMark } from "@/components/shared/brand/brand-mark"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  className?: string
  inverse?: boolean
  size?: "md" | "lg"
  workspace?: string
}

export function BrandLogo({
  className,
  inverse = false,
  size = "md",
  workspace,
}: BrandLogoProps) {
  return (
    <div
      aria-label="UniSage"
      className={cn(
        "flex items-center",
        size === "lg" ? "gap-3" : "gap-2.5",
        className
      )}
      role="img"
    >
      <BrandMark className={cn(size === "lg" ? "size-12" : "size-10")} />
      <div className="leading-tight">
        <div
          className={cn(
            "font-extrabold tracking-[-0.055em]",
            size === "lg" ? "text-2xl" : "text-xl"
          )}
        >
          <span className={cn(inverse ? "text-white" : "text-brand-mark")}>
            Uni
          </span>
          <span className={cn(inverse ? "text-white" : "text-brand-glyph")}>
            Sage
          </span>
        </div>
        {workspace ? (
          <div
            className={cn(
              "mt-0.5 font-semibold tracking-[0.1em] uppercase",
              size === "lg" ? "text-[10px]" : "text-[9px]",
              inverse ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {workspace}
          </div>
        ) : null}
      </div>
    </div>
  )
}
