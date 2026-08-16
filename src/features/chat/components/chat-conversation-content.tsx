import { Copy, FileText, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react"
import { toast } from "sonner"

import { BrandMark } from "@/components/shared/brand/brand-mark"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CHAT_SOURCES } from "@/features/chat/chat-data"
import { ChatComposer } from "@/features/chat/components/chat-composer"

export function ActiveConversation() {
  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 md:px-8 md:py-8">
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground md:max-w-[75%]">
              Điều kiện tốt nghiệp ngành Công nghệ thông tin là gì?
            </div>
          </div>

          <article className="flex gap-3 md:gap-4">
            <Avatar className="mt-0.5 size-9 shrink-0">
              <AvatarFallback className="bg-secondary text-primary dark:text-info">
                <Sparkles aria-hidden="true" className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-semibold">UniSage</span>
                <span className="text-[11px] text-muted-foreground">
                  Bản xem trước tri thức
                </span>
              </div>
              <div className="space-y-4 text-sm leading-7 text-foreground/85">
                <p>
                  Sinh viên ngành Công nghệ thông tin cần hoàn thành chương
                  trình đào tạo, đạt GPA tích lũy theo quy định, đáp ứng chuẩn
                  ngoại ngữ và tin học, đồng thời không còn nghĩa vụ kỷ luật
                  hoặc tài chính chưa hoàn tất.
                </p>
                <div className="rounded-xl border-l-4 border-l-knowledge bg-accent px-4 py-3">
                  <p className="font-semibold text-accent-foreground">
                    Kiểm tra khóa đào tạo của bạn
                  </p>
                  <p className="mt-1 text-xs leading-5 text-accent-foreground/80">
                    Tổng số tín chỉ và nhóm môn tự chọn có thể khác theo từng
                    năm chương trình. Hãy kiểm tra khóa của bạn trên cổng sinh
                    viên.
                  </p>
                </div>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>Hoàn thành các nhóm tín chỉ bắt buộc và tự chọn.</li>
                  <li>Đạt GPA tích lũy theo quy định hiện hành.</li>
                  <li>Đạt chuẩn ngoại ngữ và năng lực số bắt buộc.</li>
                  <li>Nộp hồ sơ xét tốt nghiệp trước thời hạn công bố.</li>
                </ol>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {CHAT_SOURCES.slice(0, 2).map((source, index) => (
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left text-xs font-medium text-primary hover:bg-secondary dark:text-info"
                    key={source.title}
                    type="button"
                  >
                    <FileText aria-hidden="true" className="size-3.5" />[
                    {index + 1}] {source.title}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-1 text-muted-foreground">
                <Button
                  aria-label="Sao chép câu trả lời"
                  onClick={() =>
                    toast.info("Đây là bản xem trước thao tác sao chép.")
                  }
                  size="icon-sm"
                  variant="ghost"
                >
                  <Copy aria-hidden="true" />
                </Button>
                <Button
                  aria-label="Câu trả lời hữu ích"
                  size="icon-sm"
                  variant="ghost"
                >
                  <ThumbsUp aria-hidden="true" />
                </Button>
                <Button
                  aria-label="Câu trả lời chưa hữu ích"
                  size="icon-sm"
                  variant="ghost"
                >
                  <ThumbsDown aria-hidden="true" />
                </Button>
              </div>
            </div>
          </article>
        </div>
      </ScrollArea>
      <ChatComposer />
    </>
  )
}

export function NewConversation() {
  return (
    <div className="chat-empty-ambient flex min-h-0 flex-1 flex-col px-4 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:items-center md:justify-center md:py-8">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center md:flex-none">
        <BrandMark className="size-14 md:size-16" />
        <h2 className="mt-4 text-lg font-semibold tracking-tight md:mt-5 md:text-xl">
          Bắt đầu cuộc trò chuyện mới
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground md:max-w-md">
          Đặt câu hỏi về quy định học tập, thủ tục sinh viên hoặc các tài liệu
          trong thư viện tri thức.
        </p>
      </div>
      <div className="w-full shrink-0 md:mt-8 md:max-w-3xl">
        <ChatComposer centered />
      </div>
    </div>
  )
}
