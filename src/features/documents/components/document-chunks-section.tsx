import { Layers } from "lucide-react"
import { useState } from "react"

import { Pagination } from "@/components/shared/list/pagination"
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
      <CardHeader className="border-b pb-4">
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
      <CardContent className="space-y-4 pt-6">
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

  return (
    <button
      className="w-full cursor-pointer rounded-xl border bg-muted/20 p-3.5 text-left transition-colors hover:border-muted-foreground/40"
      onClick={() => setExpanded((current) => !current)}
      type="button"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          #{chunk.chunk_index + 1}
        </span>
        <RegionBadge type={chunk.region_type} />
      </div>
      <p
        className={cn(
          "text-sm leading-relaxed text-foreground",
          !expanded && "line-clamp-3"
        )}
      >
        {chunk.content}
      </p>
    </button>
  )
}
