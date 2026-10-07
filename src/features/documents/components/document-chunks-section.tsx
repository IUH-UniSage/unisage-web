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
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { useDocumentChunksQuery } from "@/features/documents/queries/use-queries"
import { RegionBadge } from "@/features/ingestion/components/steps/region-badge"
import type { Chunk } from "@/features/ingestion/schemas/ingestion-schemas"
import { cn } from "@/lib/utils"

const HEADER_SOURCE_LABELS: Record<string, string> = {
  explicit: "Rõ ràng từ tệp gốc",
  inferred: "Suy luận (dòng đầu)",
  missing: "Không xác định",
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

type MetadataEntry = { label: string; value: string }

// Only the fields that have a meaningful value for this particular chunk are
// shown - most fields only make sense for a subset of region_type/source_type
// combinations (see Chunk/SourceLocator's own docstrings in ingestion-schemas.ts).
function buildMetadataEntries(chunk: Chunk): MetadataEntry[] {
  const entries: MetadataEntry[] = []
  const locator = chunk.source_locator

  if (chunk.source_type) {
    entries.push({
      label: "Định dạng gốc",
      value: chunk.source_type.toUpperCase(),
    })
  }
  if (chunk.heading_path.length > 0) {
    entries.push({
      label: "Vị trí (mục lục)",
      value: chunk.heading_path.join(" › "),
    })
  }
  if (chunk.page_start != null) {
    entries.push({
      label: "Trang",
      value:
        chunk.page_end != null && chunk.page_end !== chunk.page_start
          ? `${chunk.page_start}–${chunk.page_end}`
          : `${chunk.page_start}`,
    })
  }
  if (locator?.sheet_name) {
    entries.push({ label: "Sheet", value: locator.sheet_name })
  }
  if (locator?.table_id) {
    entries.push({ label: "Bảng", value: locator.table_id })
  }
  if (locator?.row_start != null && locator.row_end != null) {
    entries.push({
      label: "Dòng dữ liệu",
      value:
        locator.row_count != null
          ? `${locator.row_start}–${locator.row_end} (${locator.row_count} dòng)`
          : `${locator.row_start}–${locator.row_end}`,
    })
  }
  if (locator?.is_partial_row && locator.row_part != null) {
    entries.push({
      label: "Phần của dòng",
      value:
        locator.row_part_count != null
          ? `${locator.row_part}/${locator.row_part_count} (dòng bị chia nhỏ)`
          : `Phần ${locator.row_part} (dòng bị chia nhỏ)`,
    })
  }
  if (chunk.column_names && chunk.column_names.length > 0) {
    entries.push({ label: "Tên cột", value: chunk.column_names.join(", ") })
  }
  if (chunk.has_header) {
    entries.push({
      label: "Tiêu đề bảng",
      value: chunk.header_source
        ? (HEADER_SOURCE_LABELS[chunk.header_source] ?? chunk.header_source)
        : "Có",
    })
  }
  if (chunk.header_confidence != null && chunk.header_confidence > 0) {
    entries.push({
      label: "Độ tin cậy tiêu đề",
      value: formatPercent(chunk.header_confidence),
    })
  }
  if (chunk.structure_confidence != null) {
    entries.push({
      label: "Độ tin cậy cấu trúc",
      value: formatPercent(chunk.structure_confidence),
    })
  }
  if (chunk.parse_warnings.length > 0) {
    entries.push({
      label: "Cảnh báo phân tích",
      value: chunk.parse_warnings.join(", "),
    })
  }
  if (chunk.chunking_version) {
    entries.push({
      label: "Phiên bản chia đoạn",
      value: chunk.chunking_version,
    })
  }

  return entries
}

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
    <Card
      {...tourAnchor(TOUR_ANCHORS.documentDetailChunks)}
      className="border bg-card shadow-none"
    >
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
  const [showMetadata, setShowMetadata] = useState(false)
  const isTable = chunk.region_type === "table"
  const metadataEntries = buildMetadataEntries(chunk)

  return (
    <div className="w-full rounded-xl border bg-muted/20 p-3.5 text-left transition-colors hover:border-muted-foreground/40">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          #{chunk.chunk_index + 1}
        </span>
        <div className="flex items-center gap-3">
          <RegionBadge type={chunk.region_type} />
          {metadataEntries.length > 0 ? (
            <button
              className="cursor-pointer text-xs font-medium text-primary hover:underline"
              onClick={() => setShowMetadata((current) => !current)}
              type="button"
            >
              {showMetadata ? "Ẩn metadata" : "Metadata"}
            </button>
          ) : null}
          <button
            className="cursor-pointer text-xs font-medium text-primary hover:underline"
            onClick={() => setExpanded((current) => !current)}
            type="button"
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
      </div>

      {showMetadata ? (
        <dl className="mb-3 grid grid-cols-1 gap-x-4 gap-y-1.5 rounded-lg border bg-background/60 p-3 text-xs sm:grid-cols-2">
          {metadataEntries.map((entry) => (
            <div
              className="flex justify-between gap-2 sm:block"
              key={entry.label}
            >
              <dt className="shrink-0 text-muted-foreground">{entry.label}</dt>
              <dd className="text-right font-medium text-foreground sm:text-left">
                {entry.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

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
