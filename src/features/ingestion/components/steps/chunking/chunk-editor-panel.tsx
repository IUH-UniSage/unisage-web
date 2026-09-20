import { FileText, Trash2 } from "lucide-react"
import { useState } from "react"

import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
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

function cleanMarkdownPreview(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/^\[.*\]$/.test(line.trim()))
    .join("\n")
}

export function ChunkEditorPanel({ chunk, wizard }: ChunkEditorPanelProps) {
  // The parent keys this panel by chunk (index + content), so it remounts and
  // the draft restarts from the chunk's content whenever that changes.
  const [draft, setDraft] = useState(chunk?.content ?? "")

  // A table chunk is markdown text, unreadable as raw pipes: open it as a
  // rendered table and let the user switch to the raw text to edit. This panel
  // is keyed by chunk, so the mode resets whenever another chunk is selected.
  const isTable = chunk?.region_type === "table"
  const [mode, setMode] = useState<"edit" | "preview">(
    isTable ? "preview" : "edit"
  )
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

  // Label by position: chunk_index keeps its draft value after a deletion.
  const position = wizard.chunks.findIndex(
    (item) => item.chunk_index === chunk.chunk_index
  )
  const tokens = estimateTokens(draft)

  return (
    <div className="flex flex-col space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-widest text-primary uppercase">
            Nội dung đoạn #{position + 1}
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
          <Button
            className="h-7 gap-1 rounded-lg px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => wizard.deleteChunk(chunk.chunk_index)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Trash2 className="size-3.5" />
            <span className="text-[11px] font-semibold">Xóa đoạn</span>
          </Button>
        </div>
      </div>

      {isTable ? (
        <div
          aria-label="Chế độ hiển thị đoạn"
          className="flex w-fit items-center gap-0.5 rounded-lg border bg-muted/30 p-0.5"
          role="group"
        >
          <Button
            aria-pressed={mode === "preview"}
            className="h-7 px-3 text-xs"
            onClick={() => setMode("preview")}
            size="sm"
            type="button"
            variant={mode === "preview" ? "secondary" : "ghost"}
          >
            Xem trước
          </Button>
          <Button
            aria-pressed={mode === "edit"}
            className="h-7 px-3 text-xs"
            onClick={() => setMode("edit")}
            size="sm"
            type="button"
            variant={mode === "edit" ? "secondary" : "ghost"}
          >
            Chỉnh sửa
          </Button>
        </div>
      ) : null}

      {isTable && mode === "preview" ? (
        <div className="h-80 max-h-[400px] flex-1 overflow-auto rounded-2xl border border-border bg-muted/50 p-4 md:h-[360px]">
          <MarkdownRenderer
            className="text-sm leading-relaxed"
            content={cleanMarkdownPreview(draft)}
          />
        </div>
      ) : (
        <Textarea
          className="h-80 max-h-[400px] flex-1 resize-none overflow-y-auto rounded-2xl border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-foreground focus:bg-card focus:ring-2 focus:ring-primary focus:outline-none md:h-[360px]"
          onChange={(event) => setDraft(event.target.value)}
          value={draft}
        />
      )}

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
