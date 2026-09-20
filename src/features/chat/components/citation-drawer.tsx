import { Bookmark, Download, FileText, Loader2, X } from "lucide-react"
import { useState } from "react"

import { DocumentFilePreview } from "@/components/shared/document-file-preview"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useCitationDocumentQuery } from "@/features/chat/queries/use-queries"
import type { Citation } from "@/features/chat/schemas/chat-schemas"
import { downloadFile } from "@/utils/download-file"

type CitationDrawerProps = {
  citation: Citation | null
  onClose: () => void
}

function formatPages(citation: Citation): string | null {
  if (citation.pageStart == null) return null
  if (citation.pageEnd != null && citation.pageEnd !== citation.pageStart) {
    return `tr. ${citation.pageStart}-${citation.pageEnd}`
  }
  return `tr. ${citation.pageStart}`
}

export function CitationDrawer({ citation, onClose }: CitationDrawerProps) {
  const documentQuery = useCitationDocumentQuery(citation?.documentId ?? "")
  const document = documentQuery.data
  const fileUrl = document?.fileUrl
  const fileType = document?.fileType || "PDF"
  const formattedPage = citation ? formatPages(citation) : null
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!fileUrl) return
    setIsDownloading(true)
    await downloadFile(
      fileUrl,
      document?.fileName ?? citation?.title ?? "tai-lieu"
    )
    setIsDownloading(false)
  }

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open={citation !== null}>
      <SheetContent
        className="gap-0 border-l border-border/70 bg-background p-0 shadow-2xl data-[side=right]:w-full data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl data-[side=right]:lg:max-w-3xl data-[side=right]:xl:max-w-4xl"
        overlayClassName="bg-black/40 backdrop-blur-xs"
        showCloseButton={false}
      >
        {/* Modern Document Header */}
        <SheetHeader className="shrink-0 space-y-2 border-b border-border/70 bg-muted/20 px-5 py-3.5 dark:border-white/[0.08] dark:bg-muted/10">
          <div className="flex items-center justify-between gap-3">
            {/* Left Title & Icon */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
                <FileText aria-hidden="true" className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="line-clamp-1 text-sm font-bold tracking-tight text-foreground sm:text-base">
                  {document?.title ?? citation?.title ?? "Xem trước tài liệu"}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Bản xem trước tài liệu tham chiếu
                </SheetDescription>
              </div>
            </div>

            {/* Right Toolbar Actions */}
            <div className="flex shrink-0 items-center gap-2">
              {fileUrl ? (
                <Button
                  className="h-8.5 gap-1.5 rounded-lg px-3.5 text-xs font-semibold shadow-2xs"
                  disabled={isDownloading}
                  onClick={() => void handleDownload()}
                  size="sm"
                  variant="default"
                >
                  {isDownloading ? (
                    <Loader2
                      aria-hidden="true"
                      className="size-3.5 animate-spin"
                    />
                  ) : (
                    <Download aria-hidden="true" className="size-3.5" />
                  )}
                  <span className="hidden sm:inline">Tải xuống</span>
                </Button>
              ) : null}

              <Button
                aria-label="Đóng tài liệu xem trước"
                className="size-8.5 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={onClose}
                size="icon"
                variant="ghost"
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </div>

          {/* Metadata Chips Strip */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {fileType}
            </span>

            {citation?.section ? (
              <span className="inline-flex max-w-[280px] items-center gap-1 truncate rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary sm:max-w-md">
                <Bookmark className="size-3 shrink-0 opacity-80" />
                <span className="truncate">{citation.section}</span>
              </span>
            ) : null}

            {formattedPage ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-2 py-0.5 text-[11px] font-medium text-foreground">
                <FileText className="size-3 shrink-0 text-muted-foreground" />
                {formattedPage}
              </span>
            ) : null}
          </div>
        </SheetHeader>

        {/* Document Viewer Body */}
        <div className="relative min-h-0 flex-1 bg-muted/20 dark:bg-zinc-950/40">
          {!citation?.documentId ? (
            <DrawerMessage>
              Nguồn này chưa liên kết với tài liệu để xem trước.
            </DrawerMessage>
          ) : documentQuery.isPending ? (
            <div className="flex flex-col gap-3 p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-1/3 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
              <Skeleton className="h-[70vh] w-full rounded-xl" />
            </div>
          ) : documentQuery.isError ? (
            <DrawerMessage>
              Không tải được tài liệu. Vui lòng thử lại sau.
            </DrawerMessage>
          ) : fileUrl ? (
            <DocumentFilePreview
              fill
              fileType={document?.fileType}
              fileUrl={fileUrl}
              page={citation.pageStart}
              title={document?.title ?? citation.title}
            />
          ) : (
            <DrawerMessage>Tài liệu này chưa có tệp để xem.</DrawerMessage>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DrawerMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center p-8 text-center"
      role="status"
    >
      <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <FileText className="size-6 opacity-60" />
      </div>
      <p className="max-w-xs text-sm leading-relaxed font-medium text-muted-foreground">
        {children}
      </p>
    </div>
  )
}
