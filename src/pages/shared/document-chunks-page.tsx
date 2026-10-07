import { Layers } from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  adminDocumentDetailPath,
  ingesterDocumentDetailPath,
  ROUTES,
} from "@/constants/paths"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { DocumentChunkManager } from "@/features/documents/components/document-chunk-manager"
import { useDocumentQuery } from "@/features/documents/queries/use-queries"

export function DocumentChunksPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const documentQuery = useDocumentQuery(documentId)

  const isAdmin = location.pathname.startsWith(ROUTES.admin)
  const detailPath = isAdmin
    ? adminDocumentDetailPath
    : ingesterDocumentDetailPath

  if (documentQuery.isPending) {
    return (
      <div className="space-y-4" aria-label="Đang tải tài liệu">
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    )
  }

  if (!documentId || !documentQuery.data) {
    return (
      <Card className="border bg-card p-8 text-center shadow-none">
        <p className="text-muted-foreground">
          Không tìm thấy thông tin tài liệu.
        </p>
        <Button
          className="mt-4"
          onClick={() => navigate(ROUTES.adminDocuments)}
          variant="outline"
        >
          Quay lại danh sách
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div
        {...tourAnchor(TOUR_ANCHORS.pageHeader)}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Nội dung
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Layers className="size-6 text-primary" />
            <h1 className="text-2xl font-bold wrap-break-word md:text-3xl">
              Quản lý chunk — {documentQuery.data.title}
            </h1>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Toàn bộ chunk đang được lập chỉ mục trong Qdrant cho tài liệu này,
            bao gồm cả summary/questions dùng cho tìm kiếm nội bộ - không gian
            rộng rãi hơn hộp thoại xem nhanh, và cho phép xóa từng chunk khỏi
            chỉ mục.
          </p>
        </div>

        <Button
          {...tourAnchor(TOUR_ANCHORS.pageActions)}
          className="self-end sm:self-center"
          onClick={() => navigate(detailPath(documentId))}
          type="button"
          variant="outline"
        >
          Quay lại chi tiết tài liệu
        </Button>
      </div>

      <DocumentChunkManager documentId={documentId} />
    </div>
  )
}
