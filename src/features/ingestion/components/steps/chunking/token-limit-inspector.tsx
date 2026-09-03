import { AlertTriangle } from "lucide-react"
import { useMemo, useState } from "react"

import {
  estimateTokens,
  type StepProps,
} from "@/features/ingestion/components/steps/shared"
import { cn } from "@/lib/utils"

const PRESETS = [256, 512, 1024, 2048]

/**
 * A self-contained inspector for the review step: pick a per-chunk token
 * ceiling and see how many of the current chunks exceed it. Its state is
 * local - it doesn't feed the chunking request.
 */
export function TokenLimitInspector({ wizard }: StepProps) {
  const [tokenLimit, setTokenLimit] = useState(512)

  const overLimitCount = useMemo(
    () =>
      wizard.chunks.filter(
        (chunk) => estimateTokens(chunk.content) > tokenLimit
      ).length,
    [wizard.chunks, tokenLimit]
  )

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
        <span className="flex items-center gap-1 text-muted-foreground">
          <AlertTriangle className="h-3 w-3" /> Giới hạn Token
        </span>
        <span
          className={cn(
            "font-black",
            overLimitCount > 0 ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {tokenLimit} tk
        </span>
      </div>
      <input
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        max="4096"
        min="64"
        onChange={(event) => setTokenLimit(+event.target.value)}
        step="64"
        type="range"
        value={tokenLimit}
      />
      <div className="flex gap-1.5">
        {PRESETS.map((preset) => (
          <button
            className={cn(
              "flex-1 cursor-pointer rounded-lg border py-1 text-[9px] font-black transition-all",
              tokenLimit === preset
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-muted text-muted-foreground hover:border-muted-foreground/40"
            )}
            key={preset}
            onClick={() => setTokenLimit(preset)}
            type="button"
          >
            {preset}
          </button>
        ))}
      </div>
      {overLimitCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
          <p className="text-[9px] font-black text-destructive">
            {overLimitCount} đoạn vượt {tokenLimit} tokens
          </p>
        </div>
      )}
    </div>
  )
}
