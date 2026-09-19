import { FileText, Trash2 } from "lucide-react"

import { RegionBadge } from "@/features/ingestion/components/steps/region-badge"
import {
  estimateTokens,
  type StepProps,
} from "@/features/ingestion/components/steps/shared"
import type { Chunk } from "@/features/ingestion/schemas/ingestion-schemas"
import { cn } from "@/lib/utils"

type ChunkListPanelProps = StepProps & {
  activeChunkIndex: number | undefined
  onSelect: (chunkIndex: number) => void
}

export function ChunkListPanel({
  activeChunkIndex,
  onSelect,
  wizard,
}: ChunkListPanelProps) {
  if (wizard.chunks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
        <FileText className="h-8 w-8 opacity-20" />
        <p className="text-xs font-bold italic">
          Nhấn "Áp dụng" để xem bản nháp phân đoạn.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
          Bản đồ đoạn
        </span>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black text-primary">
          {wizard.chunks.length} đoạn
        </span>
      </div>

      <div className="max-h-128 space-y-2 overflow-y-auto pr-1">
        {wizard.chunks.map((chunk: Chunk, position: number) => {
          const idx = chunk.chunk_index
          const isActive = idx === activeChunkIndex

          return (
            <div
              className={cn(
                "group relative flex w-full cursor-pointer flex-col rounded-xl border p-3 text-left transition-all",
                isActive
                  ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/30"
                  : "border-border bg-muted/40 hover:border-muted-foreground/40"
              )}
              key={idx}
              onClick={() => onSelect(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelect(idx)
                }
              }}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span
                  className={cn(
                    "text-[9px] font-black tracking-widest uppercase",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  #{position + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <RegionBadge type={chunk.region_type} />
                  <span className="text-[8px] font-bold text-muted-foreground">
                    ~{estimateTokens(chunk.content)}tk
                  </span>
                  <button
                    aria-label={`Xóa đoạn #${position + 1}`}
                    className="ml-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      wizard.deleteChunk(idx)
                    }}
                    type="button"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <p
                className={cn(
                  "line-clamp-2 text-xs leading-snug font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {chunk.content}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
