import { Bookmark, Download, FileText, Loader2, X } from "lucide-react"
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react"

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
import { getErrorCode } from "@/utils/error-handler"
import { STORAGE_KEYS, storage } from "@/utils/local-storage"

// ErrorCode.DOCUMENT_VIEW_FORBIDDEN: a private document the viewer's department
// access doesn't clear (guests are refused every private document).
const DOCUMENT_VIEW_FORBIDDEN = 2312

type CitationDrawerProps = {
  citation: Citation | null
  onClose: () => void
  /**
   * `inline`: a column of the chat page next to the conversation (desktop) - no overlay,
   * nothing dimmed, the chat keeps working. Default: a sheet sliding over the page (mobile).
   */
  inline?: boolean
  /**
   * The cited chunks of the same document in that reply, one per page range: one
   * marker number can stand for several pages, so the viewer can jump between them.
   */
  relatedCitations?: Citation[]
}

// Inline column width bounds (px): the document stays readable and the chat next
// to it keeps at least CHAT_MIN_WIDTH.
const DRAWER_MIN_WIDTH = 360
const CHAT_MIN_WIDTH = 420
const KEYBOARD_RESIZE_STEP = 32

function clampDrawerWidth(width: number): number {
  const max = Math.max(DRAWER_MIN_WIDTH, window.innerWidth - CHAT_MIN_WIDTH)
  return Math.round(Math.min(Math.max(width, DRAWER_MIN_WIDTH), max))
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
  relatedCitations = [],
}: CitationDrawerProps) {
  // The sheet closes on Esc by itself (Radix); the inline column needs its own listener.
  // Registered on `document` (bubble): Radix layers (dialogs, popovers, menus) handle
  // Esc earlier in the capture phase and mark it handled, and this still runs before
  // the window-level listener of an open clarification panel.
  const isInlineOpen = inline && citation !== null
  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented) return
    if (
      document.querySelector(
        '[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]'
      )
    ) {
      return
    }
    event.preventDefault()
    onClose()
  })

  useEffect(() => {
    if (!isInlineOpen) return
    const handleKeyDown = (event: KeyboardEvent) => onEscape(event)
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isInlineOpen])

  const contentKey = citation
    ? `${citation.documentId ?? citation.title}-${citation.index}`
    : "none"

  if (inline) {
    if (!citation) return null
    return (
      <ResizableColumn>
        <CitationContent
          citation={citation}
          key={contentKey}
          onClose={onClose}
          relatedCitations={relatedCitations}
        />
      </ResizableColumn>
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
          <CitationContent
            citation={citation}
            key={contentKey}
            onClose={onClose}
            relatedCitations={relatedCitations}
            sheet
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

// The desktop document column; its left edge drags (or arrow-keys) to resize, and the
// width is kept for the next document.
function ResizableColumn({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState<number | null>(() => {
    const saved = storage.get<number>(STORAGE_KEYS.citationDrawerWidth)
    return typeof saved === "number" ? clampDrawerWidth(saved) : null
  })
  const [isResizing, setIsResizing] = useState(false)
  const columnRef = useRef<HTMLElement>(null)

  const applyWidth = (next: number) => {
    const clamped = clampDrawerWidth(next)
    setWidth(clamped)
    return clamped
  }

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const column = columnRef.current
    if (!column || event.button !== 0) return
    event.preventDefault()
    const right = column.getBoundingClientRect().right
    const handle = event.currentTarget
    handle.setPointerCapture(event.pointerId)
    setIsResizing(true)
    let latest = column.offsetWidth

    const onMove = (moveEvent: PointerEvent) => {
      latest = applyWidth(right - moveEvent.clientX)
    }
    const onUp = () => {
      setIsResizing(false)
      storage.set(STORAGE_KEYS.citationDrawerWidth, latest)
      handle.removeEventListener("pointermove", onMove)
      handle.removeEventListener("pointerup", onUp)
      handle.removeEventListener("pointercancel", onUp)
    }
    handle.addEventListener("pointermove", onMove)
    handle.addEventListener("pointerup", onUp)
    handle.addEventListener("pointercancel", onUp)
  }

  const resizeWithKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    event.preventDefault()
    const current = width ?? columnRef.current?.offsetWidth ?? DRAWER_MIN_WIDTH
    const delta =
      event.key === "ArrowLeft" ? KEYBOARD_RESIZE_STEP : -KEYBOARD_RESIZE_STEP
    storage.set(STORAGE_KEYS.citationDrawerWidth, applyWidth(current + delta))
  }

  return (
    <aside
      aria-label="Tài liệu tham chiếu"
      className={cn(
        "relative flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-l border-border/70 bg-background dark:border-white/[0.08]",
        width === null && "w-[46%] max-w-4xl min-w-[420px]",
        isResizing && "select-none"
      )}
      ref={columnRef}
      style={width === null ? undefined : { width: `${width}px` }}
    >
      <div
        aria-label="Kéo để thay đổi độ rộng tài liệu"
        aria-orientation="vertical"
        aria-valuemin={DRAWER_MIN_WIDTH}
        aria-valuenow={width ?? undefined}
        className={cn(
          "group absolute inset-y-0 left-0 z-20 w-2 cursor-col-resize touch-none hover:bg-primary/20 focus-visible:bg-primary/30 focus-visible:outline-none",
          isResizing && "bg-primary/30"
        )}
        onKeyDown={resizeWithKeyboard}
        onPointerDown={startResize}
        role="separator"
        tabIndex={0}
        title="Kéo để thay đổi độ rộng"
      >
        <div className="absolute inset-y-0 left-0 w-0.5 group-hover:bg-primary/50" />
      </div>
      {/* While dragging, the PDF frame would swallow pointer events. */}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          isResizing && "pointer-events-none"
        )}
      >
        {children}
      </div>
    </aside>
  )
}

type CitationContentProps = {
  citation: Citation
  onClose: () => void
  relatedCitations: Citation[]
  /** Inside a `SheetContent`: the title/description must be the sheet's own (a11y). */
  sheet?: boolean
}

function CitationContent({
  citation: openedCitation,
  onClose,
  relatedCitations,
  sheet = false,
}: CitationContentProps) {
  // The page shown: the one the reader clicked, or another cited page of it.
  const [citation, setCitation] = useState(openedCitation)
  const pageChoices = relatedCitations.filter((item) => item.pageStart != null)
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

          {formattedPage && pageChoices.length < 2 ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-2 py-0.5 text-[11px] font-medium text-foreground">
              <FileText className="size-3 shrink-0 text-muted-foreground" />
              {formattedPage}
            </span>
          ) : null}
        </div>

        {pageChoices.length > 1 ? (
          <div
            aria-label="Các trang được trích dẫn"
            className="flex flex-wrap items-center gap-1.5"
            role="group"
          >
            <span className="text-[11px] font-medium text-muted-foreground">
              Trang được trích:
            </span>
            {pageChoices.map((item) => {
              const isCurrent =
                item.index === citation.index ||
                formatPages(item) === formattedPage
              return (
                <button
                  aria-pressed={isCurrent}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[11px] font-medium tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/10"
                  )}
                  key={item.index}
                  onClick={() => setCitation(item)}
                  type="button"
                >
                  {formatPages(item)}
                </button>
              )
            })}
          </div>
        ) : null}
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
            {getErrorCode(documentQuery.error) === DOCUMENT_VIEW_FORBIDDEN
              ? "Bạn không có quyền xem tài liệu này."
              : "Không tải được tài liệu. Vui lòng thử lại sau."}
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
