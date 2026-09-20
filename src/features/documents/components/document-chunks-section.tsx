import { Layers } from "lucide-react"
import { useState } from "react"

import { Pagination } from "@/components/shared/list/pagination"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDocumentChunksQuery } from "@/features/documents/queries/use-queries"
import { RegionBadge } from "@/features/ingestion/components/steps/region-badge"
import type { Chunk } from "@/features/ingestion/schemas/ingestion-schemas"
import { cn } from "@/lib/utils"

const CHUNKS_PAGE_SIZE = 20

function cleanMarkdownPreview(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/^\[.*\]$/.test(line.trim()))
    .join("\n")
}

type DocumentChunksSectionProps = {
  documentId: string
}

export function DocumentChunksSection({
  documentId,
}: DocumentChunksSectionProps) {
  const [page, setPage] = useState(1)
  const chunksQuery = useDocumentChunksQuery(documentId, {
    limit: CHUNKS_PAGE_SIZE,
    page,
  })

  const totalItems = chunksQuery.data?.total_items ?? 0

  return (
    <Card className="border bg-card shadow-none">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">
            Các đoạn đã chia (Chunks)
          </CardTitle>
          {totalItems > 0 ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {totalItems}
            </span>
          ) : null}
        </div>
        <CardDescription>
          Danh sách các đoạn nội dung được chia ra từ tài liệu trong bước nạp
          liệu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {chunksQuery.isPending ? (
          <div className="space-y-2" aria-label="Đang tải danh sách chunks">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : !chunksQuery.data || chunksQuery.data.data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground italic">
            Tài liệu này chưa được chia đoạn.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {chunksQuery.data.data.map((chunk) => (
                <ChunkRow chunk={chunk} key={chunk.chunk_index} />
              ))}
            </div>
            <Pagination
              currentPage={chunksQuery.data.page}
              onPageChange={setPage}
              pageSize={CHUNKS_PAGE_SIZE}
              totalItems={chunksQuery.data.total_items}
              totalPages={chunksQuery.data.total_pages}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

function ChunkRow({ chunk }: { chunk: Chunk }) {
  const [expanded, setExpanded] = useState(false)
  const isTable = chunk.region_type === "table"

  return (
    <div className="w-full rounded-xl border bg-muted/20 p-3.5 text-left transition-colors hover:border-muted-foreground/40">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          #{chunk.chunk_index + 1}
        </span>
        <div className="flex items-center gap-2">
          <RegionBadge type={chunk.region_type} />
          <button
            className="cursor-pointer text-xs font-medium text-primary hover:underline"
            onClick={() => setExpanded((current) => !current)}
            type="button"
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
      </div>

      {isTable ? (
        <div
          className={cn(
            "overflow-auto text-sm leading-relaxed",
            !expanded && "max-h-48 overflow-hidden"
          )}
        >
          <MarkdownRenderer
            className="text-sm leading-relaxed"
            content={cleanMarkdownPreview(chunk.content)}
          />
        </div>
      ) : (
        <p
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap text-foreground",
            !expanded && "line-clamp-3"
          )}
        >
          {chunk.content}
        </p>
      )}
    </div>
  )
}
