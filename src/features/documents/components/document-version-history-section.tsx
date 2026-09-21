import { Download, History } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDocumentVersionsQuery } from "@/features/documents/queries/use-queries"
import type { DocumentVersion } from "@/features/documents/schemas/document-version-schemas"
import { formatDateTime } from "@/utils/date"

type DocumentVersionHistorySectionProps = {
  documentId: string
}

export function DocumentVersionHistorySection({
  documentId,
}: DocumentVersionHistorySectionProps) {
  const versionsQuery = useDocumentVersionsQuery(documentId)
  const versions = versionsQuery.data ?? []

  return (
    <Card className="border bg-card shadow-none">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">
            Lịch sử phiên bản
          </CardTitle>
          {versions.length > 0 ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {versions.length}
            </span>
          ) : null}
        </div>
        <CardDescription>
          Danh sách các tệp tin phiên bản cũ đã bị thay thế bởi bản tải lên mới
          hơn.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {versionsQuery.isPending ? (
          <div className="space-y-2" aria-label="Đang tải lịch sử phiên bản">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : versions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground italic">
            Tài liệu này chưa có phiên bản cũ nào.
          </p>
        ) : (
          versions.map((version) => (
            <VersionRow key={version.id} version={version} />
          ))
        )}
      </CardContent>
    </Card>
  )
}

function VersionRow({ version }: { version: DocumentVersion }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/20 p-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          v{version.versionNumber}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {version.fileName || "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {version.uploadedByName || "Hệ thống"} ·{" "}
            {formatDateTime(version.createdAt)}
          </p>
        </div>
      </div>

      {version.fileUrl ? (
        <a
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50"
          href={version.fileUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Download aria-hidden="true" className="size-3.5" />
          Tải xuống
        </a>
      ) : null}
    </div>
  )
}
