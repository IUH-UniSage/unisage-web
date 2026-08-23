import { Paperclip, Send } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ChatComposerProps = {
  centered?: boolean
  disabled?: boolean
  onSubmit: (content: string) => void
}

export function ChatComposer({
  centered = false,
  disabled = false,
  onSubmit,
}: ChatComposerProps) {
  const [value, setValue] = useState("")

  const submit = () => {
    const content = value.trim()
    if (!content || disabled) return

    onSubmit(content)
    setValue("")
  }

  return (
    <div
      className={cn(
        "bg-card px-4 py-4",
        centered
          ? "w-full bg-transparent px-0 md:px-0"
          : "border-t border-border/60 md:px-6"
      )}
    >
      <form
        className={cn(
          "mx-auto flex max-w-3xl items-center gap-1.5 rounded-2xl border border-border/60 bg-card p-2 transition-[background-color,border-color,box-shadow] focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-primary/10 dark:bg-muted",
          centered
            ? "min-h-16 shadow-sm dark:shadow-[0_18px_48px_rgb(0_0_0_/_0.24)]"
            : "shadow-xs"
        )}
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <Button
          aria-label="Đính kèm tệp"
          className="shrink-0 rounded-full"
          disabled={disabled}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Paperclip aria-hidden="true" />
        </Button>
        <Input
          aria-label="Tin nhắn gửi UniSage"
          autoFocus={centered}
          className="h-10 border-0 bg-transparent text-[15px] shadow-none focus-visible:ring-0"
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          placeholder={
            centered ? "Bạn muốn tìm hiểu điều gì?" : "Đặt câu hỏi tiếp theo..."
          }
          value={value}
        />
        <Button
          aria-label="Gửi tin nhắn"
          className="shrink-0 rounded-full"
          disabled={disabled || !value.trim()}
          size="icon"
          type="submit"
        >
          <Send aria-hidden="true" />
        </Button>
      </form>
      <p className="mx-auto mt-2.5 max-w-3xl text-center text-[11px] text-muted-foreground">
        UniSage có thể mắc sai sót. Hãy kiểm chứng quyết định quan trọng với
        nguồn tài liệu được trích dẫn.
      </p>
    </div>
  )
}
