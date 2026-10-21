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
import { cn } from "@/lib/utils"
import { downloadFile } from "@/utils/download-file"

type CitationDrawerProps = {
  citation: Citation | null
  onClose: () => void
  /**
   * `inline`: a column of the chat page next to the conversation (desktop) - no overlay,
   * nothing dimmed, the chat keeps working. Default: a sheet sliding over the page (mobile).
   */
  inline?: boolean
}

function formatPages(citation: Citation): string | null {
  if (citation.pageStart == null) return null
  if (citation.pageEnd != null && citation.pageEnd !== citation.pageStart) {
    return `tr. ${citation.pageStart}-${citation.pageEnd}`
  }
  return `tr. ${citation.pageStart}`
}

export function CitationDrawer({
  citation,
  onClose,
  inline = false,
}: CitationDrawerProps) {
  if (inline) {
    if (!citation) return null
    return (
      <aside
        aria-label="Tài liệu tham chiếu"
        className="flex h-full min-h-0 w-[46%] max-w-4xl min-w-[420px] shrink-0 flex-col overflow-hidden border-l border-border/70 bg-background dark:border-white/[0.08]"
      >
        <CitationContent citation={citation} onClose={onClose} />
      </aside>
    )
  }

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open={citation !== null}>
      <SheetContent
        className="gap-0 border-l border-border/70 bg-background p-0 shadow-2xl data-[side=right]:w-full data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl data-[side=right]:lg:max-w-3xl data-[side=right]:xl:max-w-4xl"
        overlayClassName="bg-black/20"
        showCloseButton={false}
      >
        {citation ? (
          <CitationContent citation={citation} onClose={onClose} sheet />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

type CitationContentProps = {
  citation: Citation
  onClose: () => void
  /** Inside a `SheetContent`: the title/description must be the sheet's own (a11y). */
  sheet?: boolean
}

function CitationContent({
  citation,
  onClose,
  sheet = false,
}: CitationContentProps) {
  const documentQuery = useCitationDocumentQuery(citation.documentId ?? "")
  const document = documentQuery.data
  const fileUrl = document?.fileUrl
  const fileType = document?.fileType || "PDF"
  const formattedPage = formatPages(citation)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!fileUrl) return
    setIsDownloading(true)
    await downloadFile(
      fileUrl,
      document?.fileName ?? citation.title ?? "tai-lieu"
    )
    setIsDownloading(false)
  }

  const Header = sheet ? SheetHeader : "header"
  const Title = sheet ? SheetTitle : "h2"
  const Description = sheet ? SheetDescription : "p"
  const title = document?.title ?? citation.title ?? "Xem trước tài liệu"

  return (
    <>
      {/* Document header */}
      <Header
        className={cn(
          "shrink-0 space-y-2 border-b border-border/70 bg-muted/20 px-5 py-3.5 dark:border-white/[0.08] dark:bg-muted/10",
          !sheet && "flex flex-col"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
              <FileText aria-hidden="true" className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <Title className="line-clamp-1 text-sm font-bold tracking-tight text-foreground sm:text-base">
                {title}
              </Title>
              <Description className="sr-only">
                Bản xem trước tài liệu tham chiếu
              </Description>
            </div>
          </div>

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

        {/* Metadata chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {fileType}
          </span>

          {citation.section ? (
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
      </Header>

      {/* Document viewer */}
      <div className="relative min-h-0 flex-1 bg-muted/20 dark:bg-zinc-950/40">
        {!citation.documentId ? (
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
    </>
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
