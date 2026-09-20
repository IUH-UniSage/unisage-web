import { useEffect, useRef, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type PreviewKind = "docx" | "iframe" | "txt" | "unsupported" | "xlsx"

// Browsers render PDF/HTML natively via <iframe> - no viewer needed. HTML is
// sandboxed below (see the iframe render) - an uploaded document is untrusted
// content and must never execute script in this page's origin. PDF must NOT
// be sandboxed: Chrome refuses to open its PDF viewer inside a sandboxed
// frame and shows "This page has been blocked by Chrome". A PDF is served from
// the storage origin, not this page's, so it cannot reach this page anyway. TXT is
// fetched and decoded as UTF-8 ourselves (see TxtPreview) instead of relying
// on the iframe, because the server doesn't always send a charset in its
// Content-Type header and the browser then guesses one, garbling Vietnamese
// text. DOCX and XLSX have no native browser renderer, so they're rendered
// client-side (docx-preview / xlsx, lazy-loaded below). Legacy .doc/.xls
// (pre-OOXML binary formats) aren't supported by either library.
function getPreviewKind(fileType: string | null | undefined): PreviewKind {
  switch (fileType?.toUpperCase()) {
    case "PDF":
    case "HTML":
      return "iframe"
    case "TXT":
      return "txt"
    case "DOCX":
      return "docx"
    case "XLSX":
      return "xlsx"
    default:
      return "unsupported"
  }
}

type DocumentFilePreviewProps = {
  // Fill the parent's height (edge to edge) instead of the default fixed-height card.
  fill?: boolean
  fileType: string | null | undefined
  fileUrl: string
  // 1-based page to open a PDF on; ignored for other types.
  page?: number | null
  title: string
}

const FILL_FRAME_CLASS = "h-full rounded-none border-0 shadow-none"

export function DocumentFilePreview({
  fill = false,
  fileType,
  fileUrl,
  page,
  title,
}: DocumentFilePreviewProps) {
  const kind = getPreviewKind(fileType)
  const frameClassName = fill ? FILL_FRAME_CLASS : undefined
  const isPdf = fileType?.toUpperCase() === "PDF"

  if (kind === "iframe") {
    return (
      <iframe
        className={cn(
          "h-125 w-full rounded-xl border bg-background shadow-xs",
          frameClassName
        )}
        sandbox={isPdf ? undefined : "allow-same-origin"}
        src={isPdf && page ? `${fileUrl}#page=${page}` : fileUrl}
        title={`Xem trước ${title}`}
      />
    )
  }

  if (kind === "txt") {
    return <TxtPreview fileUrl={fileUrl} frameClassName={frameClassName} />
  }

  if (kind === "docx") {
    return <DocxPreview fileUrl={fileUrl} frameClassName={frameClassName} />
  }

  if (kind === "xlsx") {
    return <XlsxPreview fileUrl={fileUrl} frameClassName={frameClassName} />
  }

  return (
    <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
      Trình duyệt không hỗ trợ xem trước trực tiếp định dạng{" "}
      <span className="font-semibold text-foreground">
        {fileType?.toUpperCase() || "này"}
      </span>
      . Vui lòng tải tệp về để xem nội dung.
    </div>
  )
}

function PreviewFrame({
  children,
  className,
  html,
}: {
  children?: React.ReactNode
  className?: string
  html?: string
}) {
  const sharedClassName = cn(
    "h-125 w-full overflow-auto rounded-xl border bg-muted/20 p-4",
    className
  )

  if (html !== undefined) {
    return (
      <div
        className={sharedClassName}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return <div className={sharedClassName}>{children}</div>
}

function PreviewError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function TxtPreview({
  fileUrl,
  frameClassName,
}: {
  fileUrl: string
  frameClassName?: string
}) {
  const [text, setText] = useState<string>()
  const [status, setStatus] = useState<"error" | "loading" | "ready">("loading")

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const response = await fetch(fileUrl)
        if (!response.ok) throw new Error("Không tải được tệp TXT.")
        const buffer = await response.arrayBuffer()
        if (cancelled) return

        setText(new TextDecoder("utf-8").decode(buffer))
        setStatus("ready")
      } catch {
        if (!cancelled) setStatus("error")
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [fileUrl])

  if (status === "error") {
    return (
      <PreviewError message="Không thể hiển thị bản xem trước tệp TXT này. Vui lòng tải tệp về để xem nội dung." />
    )
  }

  if (status === "loading" || text === undefined) {
    return (
      <PreviewFrame className={cn("space-y-2", frameClassName)}>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </PreviewFrame>
    )
  }

  return (
    <PreviewFrame className={cn("bg-background", frameClassName)}>
      <pre className="font-mono text-sm whitespace-pre-wrap text-foreground">
        {text}
      </pre>
    </PreviewFrame>
  )
}

function DocxPreview({
  fileUrl,
  frameClassName,
}: {
  fileUrl: string
  frameClassName?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"error" | "loading" | "ready">("loading")

  useEffect(() => {
    let cancelled = false

    const render = async () => {
      const container = containerRef.current
      if (!container) return

      try {
        const [{ renderAsync }, response] = await Promise.all([
          import("docx-preview"),
          fetch(fileUrl),
        ])
        if (!response.ok) throw new Error("Không tải được tệp DOCX.")
        const blob = await response.blob()
        if (cancelled) return

        container.replaceChildren()
        // inWrapper (default true) makes docx-preview add its own
        // `.docx-wrapper` with flex centering, so multi-page docs sit
        // centered instead of pinned to the left inside our wider frame.
        await renderAsync(blob, container, container)
        if (!cancelled) setStatus("ready")
      } catch {
        if (!cancelled) setStatus("error")
      }
    }

    void render()

    return () => {
      cancelled = true
    }
  }, [fileUrl])

  if (status === "error") {
    return (
      <PreviewError message="Không thể hiển thị bản xem trước tệp DOCX này. Vui lòng tải tệp về để xem nội dung." />
    )
  }

  return (
    <PreviewFrame
      className={cn(status === "loading" && "space-y-2", frameClassName)}
    >
      {status === "loading" ? (
        <>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </>
      ) : null}
      <div
        className={cn(status === "loading" && "hidden")}
        ref={containerRef}
      />
    </PreviewFrame>
  )
}

function XlsxPreview({
  fileUrl,
  frameClassName,
}: {
  fileUrl: string
  frameClassName?: string
}) {
  const [sheets, setSheets] = useState<{ html: string; name: string }[]>()
  const [activeSheet, setActiveSheet] = useState(0)
  const [status, setStatus] = useState<"error" | "loading" | "ready">("loading")

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [XLSX, response] = await Promise.all([
          import("xlsx"),
          fetch(fileUrl),
        ])
        if (!response.ok) throw new Error("Không tải được tệp XLSX.")
        const buffer = await response.arrayBuffer()
        if (cancelled) return

        const workbook = XLSX.read(buffer, { type: "array" })
        const nextSheets = workbook.SheetNames.map((name) => ({
          html: XLSX.utils.sheet_to_html(workbook.Sheets[name]),
          name,
        }))

        setSheets(nextSheets)
        setActiveSheet(0)
        setStatus("ready")
      } catch {
        if (!cancelled) setStatus("error")
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [fileUrl])

  if (status === "error") {
    return (
      <PreviewError message="Không thể hiển thị bản xem trước tệp XLSX này. Vui lòng tải tệp về để xem nội dung." />
    )
  }

  if (status === "loading" || !sheets) {
    return (
      <PreviewFrame className={cn("space-y-2", frameClassName)}>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </PreviewFrame>
    )
  }

  return (
    <div className={cn("space-y-2", frameClassName && "flex h-full flex-col")}>
      {sheets.length > 1 ? (
        <div className="flex flex-wrap gap-1.5">
          {sheets.map((sheet, index) => (
            <button
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                index === activeSheet
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
              key={sheet.name}
              onClick={() => setActiveSheet(index)}
              type="button"
            >
              {sheet.name}
            </button>
          ))}
        </div>
      ) : null}
      <PreviewFrame
        className={cn(
          "[&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs",
          frameClassName && "min-h-0 flex-1 rounded-none border-0"
        )}
        html={sheets[activeSheet].html}
      />
    </div>
  )
}
