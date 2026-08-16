import { Paperclip, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ChatComposerProps = {
  centered?: boolean
}

export function ChatComposer({ centered = false }: ChatComposerProps) {
  return (
    <div
      className={cn(
        "bg-card px-4 py-4 dark:border-white/[0.06]",
        centered ? "w-full bg-transparent px-0 md:px-0" : "border-t md:px-6"
      )}
    >
      <form
        className={cn(
          "mx-auto flex max-w-3xl items-center gap-2 border bg-card p-2 transition-[background-color,border-color,box-shadow] dark:border-white/[0.07] dark:bg-muted",
          centered
            ? "min-h-16 rounded-2xl shadow-sm dark:shadow-[0_18px_48px_rgb(0_0_0_/_0.24)]"
            : "rounded-xl"
        )}
        onSubmit={(event) => {
          event.preventDefault()
          toast.info("API trò chuyện chưa được kết nối.")
        }}
      >
        <Button
          aria-label="Đính kèm tệp"
          className="shrink-0"
          size="icon"
          type="button"
          variant="ghost"
        >
          <Paperclip aria-hidden="true" />
        </Button>
        <Input
          aria-label="Tin nhắn gửi UniSage"
          autoFocus={centered}
          className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
          placeholder={
            centered ? "Bạn muốn tìm hiểu điều gì?" : "Đặt câu hỏi tiếp theo..."
          }
        />
        <Button aria-label="Gửi tin nhắn" className="shrink-0" size="icon">
          <Send aria-hidden="true" />
        </Button>
      </form>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
        UniSage có thể mắc sai sót. Hãy kiểm chứng quyết định quan trọng với
        nguồn tài liệu được trích dẫn.
      </p>
    </div>
  )
}
