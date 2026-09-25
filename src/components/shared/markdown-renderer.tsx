import { Check, Copy } from "lucide-react"
import { createContext, useContext, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// `[n]` source markers the reader can click. Only indexes listed in `indexes`
// become buttons - anything else (e.g. while a reply is still streaming and its
// sources aren't known yet) stays a plain superscript.
type CitationMarkers = {
  indexes: number[]
  // Number to display for an index (defaults to the index itself).
  numbers?: Record<number, number>
  onSelect: (index: number) => void
}

const CitationMarkersContext = createContext<CitationMarkers | null>(null)

type MarkdownRendererProps = {
  citationMarkers?: CitationMarkers
  className?: string
  content: string
}

export function MarkdownRenderer({
  citationMarkers,
  className,
  content,
}: MarkdownRendererProps) {
  if (!content) return null

  // Split by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <CitationMarkersContext.Provider value={citationMarkers ?? null}>
      <div
        className={cn(
          "space-y-2.5 text-[15px] leading-[1.75] text-foreground antialiased",
          className
        )}
      >
        {parts.map((part, index) => {
          if (part.startsWith("```") && part.endsWith("```")) {
            // Code block
            const lines = part.slice(3, -3).trim().split("\n")
            const maybeLanguage = lines[0].trim()
            const isKnownLanguage = /^[a-zA-Z0-9_-]+$/.test(maybeLanguage)
            const language = isKnownLanguage ? maybeLanguage : ""
            const code = isKnownLanguage
              ? lines.slice(1).join("\n")
              : lines.join("\n")

            return (
              <CodeBlock
                code={code}
                key={`code-${index}`}
                language={language}
              />
            )
          }

          // Regular markdown text (paragraphs, headings, lists)
          return <MarkdownText block={part} key={`text-${index}`} />
        })}
      </div>
    </CitationMarkersContext.Provider>
  )
}

function CitationMarker({ indexes }: { indexes: number[] }) {
  const markers = useContext(CitationMarkersContext)

  return (
    <>
      {indexes.map((index) =>
        markers?.indexes.includes(index) ? (
          <button
            aria-label={`Xem nguồn ${markers.numbers?.[index] ?? index}`}
            className="mx-0.5 cursor-pointer rounded bg-primary/10 px-1 align-super text-[11px] leading-none font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            key={index}
            onClick={() => markers.onSelect(index)}
            type="button"
          >
            {markers.numbers?.[index] ?? index}
          </button>
        ) : (
          <sup
            className="mx-0.5 rounded bg-primary/10 px-1 text-[11px] font-semibold text-primary"
            key={index}
          >
            {index}
          </sup>
        )
      )}
    </>
  )
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-neutral-800 bg-code-block text-code-block-foreground shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-800/60 px-3.5 py-1.5 text-xs text-neutral-400">
        <span className="font-mono">{language || "plaintext"}</span>
        <Button
          className="h-7 cursor-pointer gap-1 px-2 text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white"
          onClick={() => void handleCopy()}
          size="sm"
          variant="ghost"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span className="font-medium text-emerald-400">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Sao chép</span>
            </>
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13.5px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// A pipe-delimited row like "| Hệ đào tạo | GPA tối thiểu |". The agent's
// "Cách 1" (branching-table) answers - when a rule splits cleanly by a
// student attribute with a shared set of criteria - render one of these
// followed by a "|---|---|" separator row, per the standard GFM table shape.
function isTableRow(line: string): boolean {
  return /^\|.*\|$/.test(line)
}

function isTableSeparatorRow(line: string): boolean {
  return /^\|(\s*:?-+:?\s*\|)+$/.test(line)
}

// An escaped pipe (`\|`) is text inside a cell, not a column boundary (GFM) -
// the ingestion chunker escapes cells like "Môn lý thuyết: 980.000 | Môn thực
// hành: 1.600.000" this way.
function splitTableRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, "|"))
}

function MarkdownTable({
  header,
  rows,
}: {
  header: string[]
  rows: string[][]
}) {
  return (
    <div className="my-2 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50">
            {header.map((cell, index) => (
              <th
                className="border-b border-border px-3 py-2 text-left font-semibold text-foreground"
                key={index}
              >
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr className="border-b border-border last:border-0" key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  className="px-3 py-2 align-top text-foreground"
                  key={cellIndex}
                >
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MarkdownText({ block }: { block: string }) {
  const lines = block.split(/\r?\n/)
  const elements: React.ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()

    // Markdown table: a header row immediately followed by a "|---|---|"
    // separator row - grouped here since a table spans multiple lines,
    // unlike every other block below which renders one line at a time.
    if (isTableRow(line) && isTableSeparatorRow(lines[index + 1]?.trim())) {
      const header = splitTableRow(line)
      const rows: string[][] = []
      let cursor = index + 2
      while (cursor < lines.length && isTableRow(lines[cursor].trim())) {
        rows.push(splitTableRow(lines[cursor].trim()))
        cursor += 1
      }
      elements.push(<MarkdownTable header={header} key={index} rows={rows} />)
      index = cursor
      continue
    }

    elements.push(renderLine(lines[index], index))
    index += 1
  }

  return <div className="space-y-2 text-foreground">{elements}</div>
}

function renderLine(rawLine: string, index: number): React.ReactNode {
  const line = rawLine.trim()

  // Empty line -> Spacing break
  if (!line) {
    return <div className="h-1.5" key={index} />
  }

  // Horizontal rule (---, ***, ___) - checked before the bullet-list
  // regex below, which would otherwise read "---" as a "-" bullet
  // with leftover dashes as its content.
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
    return <hr className="my-3 border-t border-border" key={index} />
  }

  // Heading 1 (# ...)
  if (line.startsWith("# ")) {
    return (
      <h1
        className="mt-4 mb-1.5 text-[20px] font-bold tracking-tight text-foreground"
        key={index}
      >
        {renderInline(line.slice(2))}
      </h1>
    )
  }

  // Heading 2 (## ...)
  if (line.startsWith("## ")) {
    return (
      <h2
        className="mt-3.5 mb-1 text-[18px] font-bold tracking-tight text-foreground"
        key={index}
      >
        {renderInline(line.slice(3))}
      </h2>
    )
  }

  // Heading 3 (### ...)
  if (line.startsWith("### ")) {
    return (
      <h3
        className="mt-3 mb-0.5 text-[16px] font-bold tracking-tight text-foreground"
        key={index}
      >
        {renderInline(line.slice(4))}
      </h3>
    )
  }

  // Standalone numbered heading like "1. Unix là gì?"
  if (/^\d+\.\s+[A-ZÀ-Ỵa-zà-ỹ0-9_].*(\?|:)?$/.test(line) && line.length < 60) {
    return (
      <h3
        className="mt-4 mb-1 text-[16.5px] font-bold tracking-tight text-foreground"
        key={index}
      >
        {renderInline(line)}
      </h3>
    )
  }

  // Blockquote (> ...) or quoted line ("...")
  if (line.startsWith("> ")) {
    return (
      <blockquote
        className="my-2 border-l-2 border-neutral-300 pl-3.5 text-neutral-700 italic dark:border-neutral-700 dark:text-neutral-300"
        key={index}
      >
        {renderInline(line.slice(2))}
      </blockquote>
    )
  }

  if (rawLine.startsWith('  "') || rawLine.startsWith('\t"')) {
    return (
      <blockquote
        className="my-1.5 border-l-2 border-neutral-300 pl-3.5 text-neutral-700 italic dark:border-neutral-700 dark:text-neutral-300"
        key={index}
      >
        {renderInline(line)}
      </blockquote>
    )
  }

  // Sub-heading / label ending with colon (e.g. "Đặc điểm:", "Ví dụ các hệ Unix:")
  if (/^[A-ZÀ-Ỵa-zà-ỹ0-9_\s]{2,40}:$/.test(line)) {
    return (
      <p className="mt-2.5 mb-0.5 font-semibold text-foreground" key={index}>
        {renderInline(line)}
      </p>
    )
  }

  // Bullet point or numbered list item
  const listMatch = rawLine.match(/^(\s*)([-*•●○◦▪▫–—]|\d+[.)])\s*(.*)$/)
  if (listMatch) {
    const indent = listMatch[1]
    const bullet = listMatch[2]
    const isNumber = /^\d+[.)]/.test(bullet)
    const content = listMatch[3]
    // Nested sub-bullets (indented in the source) sit one level deeper
    // than top-level numbered steps, so they read as belonging under
    // the step instead of lining up flush with it.
    const isNested = indent.length > 0 && !isNumber

    return (
      <div
        className={cn(
          "my-1 flex items-start gap-2.5",
          isNested ? "pl-6" : "pl-2"
        )}
        key={index}
      >
        {isNumber ? (
          <span className="shrink-0 leading-[1.7] font-medium text-foreground select-none">
            {bullet}
          </span>
        ) : (
          <span className="mt-[10px] size-[5px] shrink-0 rounded-full bg-foreground" />
        )}
        <div className="min-w-0 flex-1 leading-[1.7]">
          {renderInline(content)}
        </div>
      </div>
    )
  }

  // Normal paragraph text line
  return (
    <p className="min-w-0 leading-[1.75]" key={index}>
      {renderInline(line)}
    </p>
  )
}

function renderInline(text: string): React.ReactNode[] {
  // Regex to match a raw `<br>` (the table-parsing pipeline's line-break
  // marker for a wrapped cell - see table_normalizer.py's `strip_markup`
  // docstring: "A `<br>` is kept - it is a line break inside the cell"),
  // bold **text**, italic *text*, inline code `code`, links [text](url),
  // and bare citation markers [1] (the agent's citation_rules prompt has
  // the model emit these inline, e.g. "...khóa tuyển sinh [1][2]",
  // referencing the numbered source list at the end of the reply).
  const regex =
    /(<br\s*\/?>|\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\)|\[\d+(?:\s*,\s*\d+)*\])/gi
  const parts = text.split(regex)

  return parts.map((part, index) => {
    // Line break marker from a wrapped table cell
    if (/^<br\s*\/?>$/i.test(part)) {
      return <br key={index} />
    }

    // Bold
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong className="font-bold text-foreground" key={index}>
          {part.slice(2, -2)}
        </strong>
      )
    }

    // Italic
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em className="italic" key={index}>
          {part.slice(1, -1)}
        </em>
      )
    }

    // Inline Code
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          className="rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-[13px] font-medium text-foreground dark:bg-white/10"
          key={index}
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    // Citation marker, e.g. "[1]" or "[1, 2]" referencing the numbered sources
    const citationMatch = part.match(/^\[(\d+(?:\s*,\s*\d+)*)\]$/)
    if (citationMatch) {
      return (
        <CitationMarker
          indexes={citationMatch[1].split(",").map((n) => Number(n.trim()))}
          key={index}
        />
      )
    }

    // Link
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/)
    if (linkMatch) {
      return (
        <a
          className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          href={linkMatch[2]}
          key={index}
          rel="noopener noreferrer"
          target="_blank"
        >
          {linkMatch[1]}
        </a>
      )
    }

    return part
  })
}
