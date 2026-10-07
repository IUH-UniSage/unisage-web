import { FileSearch, Loader2 } from "lucide-react"

import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DOCUMENT_PAGE_SIZE } from "@/features/documents/hooks/use-document-dashboard"
import type { Document } from "@/features/documents/schemas/document-schemas"
import {
  getDocStatusBadgeClassName,
  getDocStatusLabel,
} from "@/constants/doc-status"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"

type IngesterProcessingListProps = {
  documents: Document[]
  isPending: boolean
  onOpenWizard: (document: Document) => void
  onPageChange: (page: number) => void
  page: number
  totalItems: number
  totalPages: number
}

export function IngesterProcessingList({
  documents,
  isPending,
  onOpenWizard,
  onPageChange,
  page,
  totalItems,
  totalPages,
}: IngesterProcessingListProps) {
  return (
    <Card
      {...tourAnchor(TOUR_ANCHORS.processingList)}
      className="border bg-card shadow-none"
    >
      <CardHeader className="border-b">
        <CardTitle>Hàng đợi xử lý tài liệu</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Tài liệu chưa xử lý xong (chờ, đang xử lý hoặc thất bại)
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {isPending ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Đang tải...
          </div>
        ) : documents.length ? (
          <div className="divide-y">
            {documents.map((document) => (
              <div
                className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_140px_auto] md:items-center md:px-5"
                key={document.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <FileSearch aria-hidden="true" className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {document.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {document.departmentName ?? "Không có phòng ban"}
                    </p>
                  </div>
                </div>
                <Badge
                  className={getDocStatusBadgeClassName(document.status)}
                  variant="ghost"
                >
                  {getDocStatusLabel(document.status)}
                </Badge>
                <Button
                  onClick={() => onOpenWizard(document)}
                  size="sm"
                  variant="outline"
                >
                  Xử lý nạp liệu
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <SearchEmpty
            description="Mọi tài liệu đã được xử lý xong."
            title="Hàng đợi trống"
          />
        )}
      </CardContent>
      <Pagination
        className="rounded-none border-x-0 border-b-0 shadow-none"
        currentPage={page}
        onPageChange={onPageChange}
        pageSize={DOCUMENT_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </Card>
  )
}
