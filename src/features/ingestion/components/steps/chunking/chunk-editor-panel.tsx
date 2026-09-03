import { FileText } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RegionBadge } from "@/features/ingestion/components/steps/region-badge"
import {
  estimateTokens,
  type StepProps,
} from "@/features/ingestion/components/steps/shared"
import type { Chunk } from "@/features/ingestion/schemas/ingestion-schemas"

type ChunkEditorPanelProps = {
  chunk: Chunk | undefined
  wizard: StepProps["wizard"]
}

export function ChunkEditorPanel({ chunk, wizard }: ChunkEditorPanelProps) {
  const [draft, setDraft] = useState(chunk?.content ?? "")
  const isDirty = chunk != null && draft !== chunk.content

  if (!chunk) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileText className="h-7 w-7 text-primary opacity-30" />
        </div>
        <p className="text-xs font-bold italic">
          Chọn một đoạn ở danh sách bên phải để xem và chỉnh sửa nội dung.
        </p>
      </div>
    )
  }

  const idx = chunk.chunk_index
  const tokens = estimateTokens(draft)

  return (
    <div className="flex flex-col space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-widest text-primary uppercase">
            Nội dung đoạn #{idx + 1}
          </span>
          <RegionBadge type={chunk.region_type} />
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold text-foreground">
            {draft.length} ký tự
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
            ~{tokens} tokens
          </span>
        </div>
      </div>

      <Textarea
        className="min-h-80 flex-1 resize-none rounded-2xl border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-foreground focus:bg-card focus:ring-2 focus:ring-primary focus:outline-none"
        onChange={(event) => setDraft(event.target.value)}
        value={draft}
      />

      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-[10px] font-medium text-muted-foreground">
          {isDirty ? "Có thay đổi chưa lưu" : "Nội dung gốc"}
        </span>
        <Button
          className="h-10 rounded-xl bg-primary text-xs font-black tracking-widest text-primary-foreground uppercase shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-40"
          disabled={!isDirty}
          onClick={() => wizard.updateChunkContent(chunk.chunk_index, draft)}
          type="button"
        >
          Lưu thay đổi
        </Button>
      </div>
    </div>
  )
}
