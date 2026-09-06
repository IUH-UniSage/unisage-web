import { ArrowUp, Maximize2, Minimize2, Plus, Square } from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ChatComposerProps = {
  centered?: boolean
  disabled?: boolean
  isStreaming?: boolean
  onStop?: () => void
  onSubmit: (content: string) => void
}

/**
 * Cleans rich HTML clipboard data (from ChatGPT, web, or docs) into natural, readable text.
 * Keeps clean bullet points (•), numbered lists, and proper spacing without injecting raw markdown symbols like ### or **.
 */
function cleanPastedText(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ""
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return ""
    }

    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()

    let inner = ""
    for (let i = 0; i < el.childNodes.length; i++) {
      inner += processNode(el.childNodes[i])
    }

    switch (tag) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        return `\n${inner.trim()}\n\n`
      case "p":
      case "div":
        return inner.trim() ? `\n${inner.trim()}\n` : ""
      case "br":
        return "\n"
      case "li": {
        const parentTag = el.parentElement?.tagName.toLowerCase()
        if (parentTag === "ol") {
          const index =
            Array.from(el.parentElement?.children || []).indexOf(el) + 1
          return `${index}. ${inner.trim()}\n`
        }
        return `• ${inner.trim()}\n`
      }
      case "ul":
      case "ol":
        return `\n${inner.trim()}\n\n`
      case "blockquote":
        return `\n"${inner.trim()}"\n\n`
      default:
        return inner
    }
  }

  return processNode(doc.body)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function ChatComposer({
  centered = false,
  disabled = false,
  isStreaming = false,
  onStop,
  onSubmit,
}: ChatComposerProps) {
  const [value, setValue] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isMultiline = value.includes("\n") || value.length > 70 || isExpanded

  // Synchronously adjust height on value changes
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    if (isExpanded) {
      textarea.style.height = "380px"
      return
    }

    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`
  }, [value, isExpanded])

  const submit = () => {
    const content = value.trim()
    if (!content || disabled) return

    onSubmit(content)
    setValue("")
    setIsExpanded(false)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift -> Submit
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = event.clipboardData.getData("text/html")

    // If pasted content contains rich HTML tags (headings, lists, bold, etc.)
    if (
      html &&
      /<(h[1-6]|ul|ol|li|strong|b|em|i|code|pre|blockquote)[^>]*>/i.test(html)
    ) {
      event.preventDefault()
      const cleaned = cleanPastedText(html)
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue =
        value.substring(0, start) + cleaned + value.substring(end)
      setValue(newValue)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + cleaned.length
        }
      }, 0)
    }
  }

  const hasValue = Boolean(value.trim())

  return (
    <div
      className={cn(
        "bg-transparent px-4 py-3 transition-all",
        centered ? "w-full px-0 md:px-0" : "border-t border-border/40 md:px-6"
      )}
    >
      <form
        className={cn(
          "relative mx-auto flex max-w-3xl items-end gap-2 rounded-[26px] border border-border/60 bg-muted/60 px-3 py-1.5 shadow-sm transition-[border-color,box-shadow,height,border-radius] dark:border-white/10 dark:bg-muted/60",
          centered && "shadow-md dark:shadow-[0_12px_36px_rgb(0_0_0_/_0.3)]",
          isExpanded && "rounded-3xl p-3.5 shadow-xl"
        )}
        onSubmit={(event) => {
          // submit() runs from handleKeyDown (Enter) or the send button's
          // onClick below - never here. A textarea's Enter shouldn't submit
          // its form natively, but some environments dispatch a real
          // `submit` event for it anyway; calling submit() again from both
          // places sent every message twice.
          event.preventDefault()
        }}
      >
        {/* Top-Right Expand/Collapse Button (Shows when multiline or expanded) */}
        {isMultiline ? (
          <button
            aria-label={
              isExpanded ? "Thu nhỏ ô soạn thảo" : "Mở rộng ô soạn thảo"
            }
            className="absolute top-2.5 right-3.5 z-10 flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground/80 transition-colors hover:bg-muted hover:text-foreground dark:text-neutral-400 dark:hover:text-white"
            onClick={() => setIsExpanded((prev) => !prev)}
            title={isExpanded ? "Thu nhỏ ô soạn thảo" : "Mở rộng ô soạn thảo"}
            type="button"
          >
            {isExpanded ? (
              <Minimize2 aria-hidden="true" className="size-3.5" />
            ) : (
              <Maximize2 aria-hidden="true" className="size-3.5" />
            )}
          </button>
        ) : null}

        {/* Plus / Attach Button pinned to bottom left */}
        <Button
          aria-label="Đính kèm hoặc thêm tùy chọn"
          className="mb-0.5 size-8.5 shrink-0 cursor-pointer rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          disabled={disabled}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Plus aria-hidden="true" className="size-5" />
        </Button>

        {/* Persistent Auto-Growing Textarea with Rich HTML -> Markdown Paste */}
        <textarea
          aria-label="Tin nhắn gửi UniSage"
          autoFocus={centered}
          className={cn(
            "min-h-[26px] flex-1 resize-none overflow-y-auto border-0 bg-transparent! py-1.5 text-[15px] leading-6 shadow-none outline-none placeholder:text-muted-foreground/70 dark:text-white",
            isMultiline && "pr-8",
            isExpanded ? "h-[380px] max-h-[65vh]" : "max-h-[220px]"
          )}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            centered ? "Hỏi bất kỳ điều gì..." : "Đặt câu hỏi tiếp theo..."
          }
          ref={textareaRef}
          rows={1}
          value={value}
        />

        {/* Send Button, swapped for Stop while a reply is streaming */}
        {isStreaming && onStop ? (
          <Button
            aria-label="Dừng tạo câu trả lời"
            className="mb-0.5 flex size-8.5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-all"
            onClick={onStop}
            size="icon"
            type="button"
          >
            <Square aria-hidden="true" className="size-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            aria-label="Gửi tin nhắn"
            className={cn(
              "mb-0.5 flex size-8.5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-all",
              !hasValue &&
                "cursor-not-allowed bg-muted-foreground/40 text-muted-foreground opacity-40 dark:bg-neutral-700 dark:text-neutral-400"
            )}
            disabled={disabled || !hasValue}
            onClick={submit}
            size="icon"
            type="button"
          >
            <ArrowUp aria-hidden="true" className="size-4.5" />
          </Button>
        )}
      </form>

      <p className="mx-auto mt-2.5 max-w-3xl text-center text-[11px] text-muted-foreground">
        UniSage có thể mắc sai sót. Hãy kiểm chứng quyết định quan trọng với
        nguồn tài liệu được trích dẫn.
      </p>
    </div>
  )
}
