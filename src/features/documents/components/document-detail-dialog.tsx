import {
  Building,
  Clock,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  Globe,
  Pencil,
  ShieldAlert,
  User,
} from "lucide-react"

import { AuditInfo } from "@/components/shared/audit-info"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getDocStatusBadgeClassName,
  getDocStatusLabel,
} from "@/constants/doc-status"
import { DocumentFilePreview } from "@/components/shared/document-file-preview"
import { DocumentChunksSection } from "@/features/documents/components/document-chunks-section"
import { DocumentVersionHistorySection } from "@/features/documents/components/document-version-history-section"
import { useDocumentQuery } from "@/features/documents/queries/use-queries"
import type { Document } from "@/features/documents/schemas/document-schemas"
import { cn } from "@/lib/utils"

type DocumentDetailDialogProps = {
  canUpdate: boolean
  documentId?: string
  onEdit: (document: Document) => void
  onOpenChange: (open: boolean) => void
  open?: boolean
}

export function DocumentDetailDialog({
  canUpdate,
  documentId,
  onEdit,
  onOpenChange,
}: DocumentDetailDialogProps) {
  const documentQuery = useDocumentQuery(documentId)
  const document = documentQuery.data

  const handleBack = () => {
    onOpenChange(false)
  }

  const handleEdit = () => {
    if (document) {
      onOpenChange(false)
      onEdit(document)
    }
  }

  if (documentQuery.isPending) {
    return <DocumentDetailSkeleton />
  }

  if (!document) {
    return (
      <div className="space-y-6">
        <Card className="border bg-card p-8 text-center shadow-none">
          <p className="text-muted-foreground">
            Không tìm thấy thông tin tài liệu.
          </p>
          <Button className="mt-4" onClick={handleBack} variant="outline">
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Nội dung
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold md:text-3xl">{document.title}</h1>
            <Badge
              className={cn(
                "gap-1.5 px-2.5",
                getDocStatusBadgeClassName(document.status)
              )}
              variant="ghost"
            >
              {getDocStatusLabel(document.status)}
            </Badge>
            {document.isPublic ? (
              <Badge variant="outline">Công khai</Badge>
            ) : (
              <Badge variant="outline">Nội bộ</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem chi tiết thông tin hồ sơ tài liệu, xem trước tệp tin và thông
            tin kiểm toán.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <Button onClick={handleBack} type="button" variant="outline">
            Quay lại
          </Button>
          {canUpdate ? (
            <Button onClick={handleEdit} type="button">
              <Pencil className="mr-2 size-4" />
              Chỉnh sửa tài liệu
            </Button>
          ) : null}
        </div>
      </div>

      {/* General Information Card */}
      <Card className="border bg-card shadow-none">
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold">
            Thông tin tài liệu & Phân loại
          </CardTitle>
          <CardDescription>
            Chi tiết về danh mục, phòng ban quản lý và các thuộc tính phân
            quyền.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Danh mục
                </span>
                <span className="block truncate text-sm font-semibold text-foreground">
                  {document.categoryName || "Không có danh mục"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Building className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Phòng ban sở hữu
                </span>
                <span className="block truncate text-sm font-semibold text-foreground">
                  {document.departmentName || "Không có phòng ban"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <FileCode className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Loại tệp & Phiên bản
                </span>
                <span className="block text-sm font-semibold text-foreground">
                  {document.fileType?.toUpperCase() || "—"} (v
                  {document.version ?? 1})
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Globe className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Phạm vi truy cập
                </span>
                <span className="block text-sm font-semibold text-foreground">
                  {document.isPublic ? "Công khai" : "Nội bộ"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <ShieldAlert className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Cấp độ truy cập tối thiểu
                </span>
                <span className="block text-sm font-semibold text-foreground">
                  {document.minAccessLevel != null
                    ? `Cấp ${document.minAccessLevel}`
                    : "Mặc định (Không giới hạn)"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <User className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Người tải lên
                </span>
                <span className="block text-sm font-semibold text-foreground">
                  {document.createdByName || "Hệ thống"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File & Preview Card */}
      <Card className="border bg-card shadow-none">
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold">
            Tệp tin & Xem trước
          </CardTitle>
          <CardDescription>
            Xem trực tiếp nội dung tài liệu hoặc tải tệp tin về máy tính.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {document.fileUrl ? (
            <div className="space-y-4">
              <DocumentFilePreview
                fileType={document.fileType}
                fileUrl={document.fileUrl}
                title={document.title}
              />

              <div className="flex flex-wrap items-center gap-3">
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50"
                  href={document.fileUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Download aria-hidden="true" className="size-4" />
                  Tải xuống tệp gốc
                </a>
                {document.sourceUrl ? (
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50"
                    href={document.sourceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink aria-hidden="true" className="size-4" />
                    Mở đường dẫn nguồn
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground italic">
              Bạn không có quyền tải tệp này, hoặc tài liệu chưa được tải tệp
              lên.
            </p>
          )}
        </CardContent>
      </Card>

      <DocumentChunksSection documentId={document.id} />

      <DocumentVersionHistorySection documentId={document.id} />

      {/* Audit Info Card */}
      <Card className="border bg-card shadow-none">
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">
              Thông tin kiểm toán & Lịch sử
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <AuditInfo
            className="border-none bg-transparent p-0"
            createdAt={document.createdAt}
            createdByName={document.createdByName}
            updatedAt={document.updatedAt}
            updatedByName={document.updatedByName}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function DocumentDetailSkeleton() {
  return (
    <div className="space-y-6" aria-label="Đang tải chi tiết tài liệu">
      <div>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-2 h-8 w-72 max-w-full" />
        <Skeleton className="mt-1 h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )
}
