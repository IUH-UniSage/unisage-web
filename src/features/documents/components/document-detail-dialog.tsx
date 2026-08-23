import { Download, Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getDocStatusBadgeClassName,
  getDocStatusLabel,
} from "@/constants/doc-status"
import { useDocumentQuery } from "@/features/documents/queries/use-queries"
import type { Document } from "@/features/documents/schemas/document-schemas"
import { cn } from "@/lib/utils"
import { formatAuditDate } from "@/utils/date-format"

// Browsers render PDF/plain-text natively via <iframe> - no viewer needed.
// DOC/DOCX has no native browser renderer; previewing those would require an
// external viewer (Google Docs Viewer, Office Online), which isn't wired up.
const BROWSER_PREVIEWABLE_TYPES = new Set(["PDF", "TXT"])

function isPreviewableInBrowser(fileType: string | null | undefined): boolean {
  return Boolean(
    fileType && BROWSER_PREVIEWABLE_TYPES.has(fileType.toUpperCase())
  )
}

type DocumentDetailDialogProps = {
  canUpdate: boolean
  documentId?: string
  onEdit: (document: Document) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function DocumentDetailDialog({
  canUpdate,
  documentId,
  onEdit,
  onOpenChange,
  open,
}: DocumentDetailDialogProps) {
  const documentQuery = useDocumentQuery(documentId)
  const document = documentQuery.data

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-2xl">
        {documentQuery.isPending ? (
          <div
            className="space-y-4 py-1"
            aria-label="Đang tải chi tiết tài liệu"
          >
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        ) : null}

        {!documentQuery.isPending && document ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="truncate text-lg">
                  {document.title}
                </DialogTitle>
                <Badge
                  className={cn(
                    "gap-1.5 px-2.5",
                    getDocStatusBadgeClassName(document.status)
                  )}
                  variant="ghost"
                >
                  {getDocStatusLabel(document.status)}
                </Badge>
              </div>
              <DialogDescription className="mt-0.5">
                {document.categoryName || "Không có danh mục"} ·{" "}
                {document.departmentName || "Không có phòng ban"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3.5 text-sm">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Loại tệp
                  </p>
                  <p className="mt-0.5">
                    {document.fileType?.toUpperCase() || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Công khai
                  </p>
                  <p className="mt-0.5">{document.isPublic ? "Có" : "Không"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Cấp độ truy cập tối thiểu
                  </p>
                  <p className="mt-0.5">
                    {document.minAccessLevel != null
                      ? `Cấp ${document.minAccessLevel}`
                      : "Mặc định"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Phiên bản
                  </p>
                  <p className="mt-0.5">{document.version ?? 1}</p>
                </div>
              </div>

              {document.fileUrl ? (
                <div className="space-y-2">
                  {isPreviewableInBrowser(document.fileType) ? (
                    <iframe
                      className="h-96 w-full rounded-lg border"
                      src={document.fileUrl}
                      title={`Xem trước ${document.title}`}
                    />
                  ) : (
                    <p className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                      Trình duyệt không xem trước được định dạng{" "}
                      {document.fileType?.toUpperCase() || "này"} — tải tệp về
                      để mở bằng ứng dụng phù hợp (Word, ...).
                    </p>
                  )}
                  <a
                    className="flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-medium hover:bg-muted/40"
                    href={document.fileUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Download aria-hidden="true" className="size-4" />
                    Tải xuống tệp
                  </a>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Bạn không có quyền tải tệp này, hoặc tài liệu chưa có tệp.
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 border-t pt-3 text-xs text-muted-foreground">
                <div>
                  <span className="block text-[11px]">Người tạo</span>
                  <span className="font-medium text-foreground">
                    {document.createdBy || "Hệ thống"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px]">Ngày tạo</span>
                  <span className="font-medium text-foreground">
                    {formatAuditDate(document.createdAt)}
                  </span>
                </div>
                {document.updatedAt ? (
                  <>
                    <div>
                      <span className="block text-[11px]">Người cập nhật</span>
                      <span className="font-medium text-foreground">
                        {document.updatedBy || "Hệ thống"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px]">
                        Cập nhật lần cuối
                      </span>
                      <span className="font-medium text-foreground">
                        {formatAuditDate(document.updatedAt)}
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Đóng
                </Button>
              </DialogClose>
              {canUpdate ? (
                <Button
                  onClick={() => {
                    onOpenChange(false)
                    onEdit(document)
                  }}
                  type="button"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Chỉnh sửa
                </Button>
              ) : null}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
