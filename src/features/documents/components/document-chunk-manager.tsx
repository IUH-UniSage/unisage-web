import { FileText, Sparkles, Trash2 } from "lucide-react"
import { useState } from "react"

import { ConfirmDeleteDialog } from "@/components/shared/dialog/confirm-delete-dialog"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useDeleteIndexedChunkMutation,
  useIndexedChunksQuery,
} from "@/features/documents/queries/use-queries"
import type { IndexedChunk } from "@/features/documents/schemas/document-chunks-schemas"
import { RegionBadge } from "@/features/ingestion/components/steps/region-badge"
import { getErrorMessage } from "@/utils/error-handler"

const HEADER_SOURCE_LABELS: Record<string, string> = {
  explicit: "Rõ ràng từ tệp gốc",
  inferred: "Suy luận (dòng đầu)",
  missing: "Không xác định",
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

const NA = "—"

type MetadataEntry = { label: string; value: string }
type MetadataGroup = { title: string; entries: MetadataEntry[] }

// Dumps every field the backend `Chunk` model can carry, grouped so a reader
// can scan by topic instead of one flat 24-row list - one entry per field,
// always, even when null/empty (per the "show everything" requirement).
function buildMetadataGroups(chunk: IndexedChunk): MetadataGroup[] {
  const locator = chunk.source_locator

  return [
    {
      title: "Nguồn gốc",
      entries: [
        { label: "chunk_id", value: chunk.chunk_id },
        { label: "source_type", value: chunk.source_type?.toUpperCase() ?? NA },
        { label: "region_type", value: chunk.region_type },
        {
          label: "block_index",
          value: chunk.block_index != null ? `${chunk.block_index}` : NA,
        },
        {
          label: "heading_path",
          value:
            chunk.heading_path.length > 0 ? chunk.heading_path.join(" › ") : NA,
        },
        {
          label: "page_start",
          value: chunk.page_start != null ? `${chunk.page_start}` : NA,
        },
        {
          label: "page_end",
          value: chunk.page_end != null ? `${chunk.page_end}` : NA,
        },
      ],
    },
    {
      title: "Vị trí trong tệp gốc",
      entries: [
        { label: "section", value: locator?.section ?? NA },
        { label: "sheet_name", value: locator?.sheet_name ?? NA },
        { label: "table_id", value: locator?.table_id ?? NA },
        {
          label: "row_start",
          value: locator?.row_start != null ? `${locator.row_start}` : NA,
        },
        {
          label: "row_end",
          value: locator?.row_end != null ? `${locator.row_end}` : NA,
        },
        {
          label: "row_count",
          value: locator?.row_count != null ? `${locator.row_count}` : NA,
        },
        {
          label: "row_part",
          value: locator?.row_part != null ? `${locator.row_part}` : NA,
        },
        {
          label: "row_part_count",
          value:
            locator?.row_part_count != null ? `${locator.row_part_count}` : NA,
        },
        {
          label: "is_partial_row",
          value: locator ? (locator.is_partial_row ? "true" : "false") : NA,
        },
      ],
    },
    {
      title: "Cấu trúc bảng",
      entries: [
        {
          label: "column_names",
          value:
            chunk.column_names && chunk.column_names.length > 0
              ? chunk.column_names.join(", ")
              : NA,
        },
        { label: "has_header", value: chunk.has_header ? "true" : "false" },
        {
          label: "header_source",
          value: chunk.header_source
            ? (HEADER_SOURCE_LABELS[chunk.header_source] ?? chunk.header_source)
            : NA,
        },
        {
          label: "header_confidence",
          value:
            chunk.header_confidence != null
              ? formatPercent(chunk.header_confidence)
              : NA,
        },
      ],
    },
    {
      title: "Chất lượng & phiên bản",
      entries: [
        {
          label: "structure_confidence",
          value:
            chunk.structure_confidence != null
              ? formatPercent(chunk.structure_confidence)
              : NA,
        },
        {
          label: "parse_warnings",
          value:
            chunk.parse_warnings.length > 0
              ? chunk.parse_warnings.join(", ")
              : NA,
        },
        { label: "chunking_version", value: chunk.chunking_version ?? NA },
        { label: "content.length", value: `${chunk.content.length} ký tự` },
      ],
    },
  ]
}

const CHUNKS_PAGE_SIZE = 20

function cleanMarkdownPreview(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/^\[.*\]$/.test(line.trim()))
    .join("\n")
}

type DocumentChunkManagerProps = {
  documentId: string
}

export function DocumentChunkManager({
  documentId,
}: DocumentChunkManagerProps) {
  const [page, setPage] = useState(1)
  const [deletingChunkId, setDeletingChunkId] = useState<string | null>(null)
  const chunksQuery = useIndexedChunksQuery(documentId, {
    limit: CHUNKS_PAGE_SIZE,
    page,
  })
  const deleteMutation = useDeleteIndexedChunkMutation(documentId)

  const handleConfirmDelete = async () => {
    if (!deletingChunkId) return
    await deleteMutation.mutateAsync(deletingChunkId)
    setDeletingChunkId(null)
  }

  if (chunksQuery.isPending) {
    return (
      <div
        className="space-y-3"
        aria-label="Đang tải danh sách chunk đã lập chỉ mục"
      >
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  if (!chunksQuery.data || chunksQuery.data.data.length === 0) {
    return (
      <SearchEmpty
        description="Tài liệu này chưa có chunk nào được lập chỉ mục (embed) vào Qdrant."
        title="Chưa có chunk đã lập chỉ mục"
      />
    )
  }

  return (
    <div className="space-y-4">
      {deleteMutation.error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          {getErrorMessage(deleteMutation.error)}
        </p>
      ) : null}

      <div className="space-y-3">
        {chunksQuery.data.data.map((chunk) => (
          <IndexedChunkCard
            chunk={chunk}
            key={chunk.chunk_id}
            onRequestDelete={() => setDeletingChunkId(chunk.chunk_id)}
          />
        ))}
      </div>

      <Pagination
        currentPage={chunksQuery.data.page}
        onPageChange={setPage}
        pageSize={CHUNKS_PAGE_SIZE}
        totalItems={chunksQuery.data.total_items}
        totalPages={chunksQuery.data.total_pages}
      />

      {deletingChunkId ? (
        <ConfirmDeleteDialog
          description={`Chunk "${deletingChunkId}" sẽ bị gỡ khỏi Qdrant và không còn được dùng để trả lời câu hỏi. Bản nháp chia đoạn gốc không bị ảnh hưởng.`}
          entityLabel="chunk"
          isSubmitting={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onOpenChange={(open) => {
            if (!open) setDeletingChunkId(null)
          }}
          title="Xóa chunk khỏi chỉ mục?"
        />
      ) : null}
    </div>
  )
}

function IndexedChunkCard({
  chunk,
  onRequestDelete,
}: {
  chunk: IndexedChunk
  onRequestDelete: () => void
}) {
  const isTable = chunk.region_type === "table"
  const metadataGroups = buildMetadataGroups(chunk)

  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card shadow-none">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge className="font-mono text-sm" variant="secondary">
            #{chunk.chunk_index + 1}
          </Badge>
          <RegionBadge type={chunk.region_type} />
        </div>
        <Button
          aria-label={`Xóa chunk ${chunk.chunk_id}`}
          className="text-destructive hover:text-destructive"
          onClick={onRequestDelete}
          size="sm"
          variant="ghost"
        >
          <Trash2 aria-hidden="true" />
          Xóa khỏi chỉ mục
        </Button>
      </div>

      <Tabs defaultValue="content">
        <div className="border-b px-4 pt-2">
          <TabsList variant="line">
            <TabsTrigger value="content">
              <FileText aria-hidden="true" />
              Nội dung gốc
            </TabsTrigger>
            <TabsTrigger value="search">
              <Sparkles aria-hidden="true" />
              Tìm kiếm nội bộ
            </TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="p-4" value="content">
          {isTable ? (
            <MarkdownRenderer
              className="text-sm leading-7"
              content={cleanMarkdownPreview(chunk.content)}
            />
          ) : (
            <p className="text-sm leading-7 whitespace-pre-wrap text-foreground">
              {chunk.content}
            </p>
          )}
        </TabsContent>

        <TabsContent className="space-y-4 p-4" value="search">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
              Summary
            </p>
            <p className="text-sm leading-7 whitespace-pre-wrap text-foreground">
              {chunk.summary || NA}
            </p>
          </div>
          {chunk.questions.length > 0 ? (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                Câu hỏi gợi ý ({chunk.questions.length})
              </p>
              <ul className="space-y-1.5">
                {chunk.questions.map((question) => (
                  <li
                    className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground"
                    key={question}
                  >
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent
          className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2"
          value="metadata"
        >
          {metadataGroups.map((group) => (
            <div className="space-y-1.5" key={group.title}>
              <p className="text-xs font-semibold text-muted-foreground">
                {group.title}
              </p>
              <dl className="space-y-1 rounded-lg border bg-muted/20 p-2.5 text-xs">
                {group.entries.map((entry) => (
                  <div
                    className="flex items-baseline justify-between gap-3"
                    key={entry.label}
                  >
                    <dt className="shrink-0 text-muted-foreground">
                      {entry.label}
                    </dt>
                    <dd className="text-right font-medium wrap-anywhere text-foreground">
                      {entry.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
