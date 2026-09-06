import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BookMarked,
  CalendarDays,
  FileQuestion,
  GraduationCap,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ROUTES } from "@/constants/paths"

type QuickLink = {
  description: string
  icon: LucideIcon
  label: string
}

const quickLinks: QuickLink[] = [
  {
    description: "Tìm hiểu quy định đăng ký học, tín chỉ và xét tốt nghiệp.",
    icon: GraduationCap,
    label: "Quy định học vụ",
  },
  {
    description: "Tra cứu lịch học phí, miễn giảm và hướng dẫn thanh toán.",
    icon: CalendarDays,
    label: "Học phí và thời hạn",
  },
  {
    description: "Xem sổ tay, quyết định và biểu mẫu chính thức đã kiểm chứng.",
    icon: BookMarked,
    label: "Thư viện tri thức",
  },
  {
    description: "Tạo và theo dõi yêu cầu hỗ trợ gửi đến nhà trường.",
    icon: FileQuestion,
    label: "Yêu cầu hỗ trợ",
  },
]

const suggestions = [
  "Làm sao đăng ký học lại?",
  "Điều kiện xét tốt nghiệp là gì?",
  "Xem hạn đóng học phí ở đâu?",
]

export function UserHomePage() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState("")

  const askAndGoToChat = (message: string) => {
    const trimmed = message.trim()
    if (!trimmed) return
    navigate(ROUTES.chat, { state: { initialMessage: trimmed } })
  }

  return (
    <div className="home-content overflow-hidden">
      <section className="home-hero relative border-b border-primary/20 bg-home-hero text-white dark:border-white/[0.06]">
        <div className="knowledge-network absolute inset-0 opacity-[0.08] dark:opacity-[0.035]" />
        <div className="absolute top-12 right-[-6rem] size-72 rounded-full border border-white/8 dark:border-primary/10" />
        <div className="absolute top-28 right-[-2rem] size-44 rounded-full border border-white/8 dark:border-primary/10" />
        <div className="absolute bottom-[-7rem] left-[-4rem] size-64 rounded-full border border-white/6 dark:border-white/[0.04]" />
        <div className="relative mx-auto flex min-h-[420px] max-w-5xl flex-col justify-center px-4 py-8 text-center md:min-h-[clamp(356px,28.2vw,540px)] md:px-6 md:py-2">
          <Badge className="mx-auto mb-4 border border-white/18 bg-white/10 text-white shadow-sm hover:bg-white/10">
            <Sparkles aria-hidden="true" className="text-knowledge" />
            Dựa trên tri thức chính thức của nhà trường
          </Badge>
          <h1 className="mx-auto max-w-3xl text-3xl leading-tight font-bold tracking-tight text-white md:text-[44px] md:leading-[1.16] xl:text-[52px]">
            Hôm nay UniSage có thể giúp bạn hiểu điều gì?
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/72 md:text-base">
            Hỏi về quy định, thủ tục, thời hạn hoặc dịch vụ trong trường. Mỗi
            câu trả lời đều kèm theo tài liệu nguồn.
          </p>

          <form
            className="mx-auto mt-6 flex w-full max-w-3xl items-center gap-2.5 rounded-full border border-white/20 bg-card px-3 py-2 shadow-[0_18px_55px_rgb(0_20_70_/_0.22)] dark:border-white/[0.06] dark:bg-card dark:shadow-[0_22px_65px_rgb(0_0_0_/_0.24)]"
            onSubmit={(event) => {
              event.preventDefault()
              askAndGoToChat(question)
            }}
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary">
              <MessageSquareText
                aria-hidden="true"
                className="size-5 text-primary"
              />
            </div>
            <Input
              aria-label="Hỏi UniSage"
              className="h-11 border-0 bg-transparent! px-2 text-base text-foreground shadow-none focus-visible:ring-0 dark:border-0 dark:bg-transparent! dark:text-white"
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Đặt câu hỏi về học vụ..."
              value={question}
            />
            <Button
              className="size-10 shrink-0 rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90"
              disabled={!question.trim()}
              size="icon"
              type="submit"
            >
              <Send aria-hidden="true" className="size-4.5" />
            </Button>
          </form>

          <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-xs font-medium text-white/60">
              Gợi ý:
            </span>
            {suggestions.map((suggestion) => (
              <button
                className="rounded-full border border-white/16 bg-white/8 px-3 py-1.5 text-xs text-white/78 transition-colors hover:border-white/30 hover:bg-white/14 hover:text-white dark:border-white/[0.09] dark:bg-white/[0.045] dark:text-white/72 dark:hover:border-primary/35 dark:hover:bg-primary/10"
                key={suggestion}
                onClick={() => askAndGoToChat(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase dark:text-info">
              Khám phá UniSage
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Bắt đầu với chủ đề phổ biến
            </h2>
          </div>
          <Button asChild className="w-fit" variant="ghost">
            <Link to={ROUTES.knowledge}>
              Xem tất cả tài nguyên
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item, index) => {
            const Icon = item.icon

            return (
              <Card
                className="group relative overflow-hidden border bg-card shadow-none transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg dark:border-white/[0.06] dark:bg-card dark:hover:border-primary/30 dark:hover:bg-muted"
                key={item.label}
              >
                <div
                  className={
                    index === 0
                      ? "absolute inset-x-0 top-0 h-1 bg-primary"
                      : index === 1
                        ? "absolute inset-x-0 top-0 h-1 bg-knowledge"
                        : "absolute inset-x-0 top-0 h-1 bg-info"
                  }
                />
                <CardContent className="p-6">
                  <div className="mb-5 grid size-11 place-items-center rounded-xl bg-secondary text-primary dark:text-info">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                  <h3 className="font-semibold">{item.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                  <Link
                    aria-label={`Khám phá ${item.label}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary dark:text-info"
                    to={index === 3 ? ROUTES.tickets : ROUTES.knowledge}
                  >
                    Khám phá
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-0 bg-home-card text-white shadow-none dark:border dark:border-primary/20">
            <CardContent className="relative overflow-hidden p-7 md:p-8">
              <div className="absolute -top-16 -right-10 size-56 rounded-full border border-white/10" />
              <div className="absolute -top-6 -right-4 size-36 rounded-full border border-white/10" />
              <Search aria-hidden="true" className="mb-8 size-7 text-info" />
              <h2 className="max-w-xl text-xl font-bold text-white md:text-2xl">
                Đối chiếu mọi câu trả lời với nguồn chính thức.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                UniSage hiển thị tài liệu tham chiếu và đoạn trích liên quan để
                bạn kiểm chứng thông tin học vụ trước khi đưa ra quyết định.
              </p>
            </CardContent>
          </Card>

          <Card className="border bg-accent shadow-none dark:border-white/[0.06] dark:bg-card">
            <CardContent className="p-7 md:p-8">
              <div className="mb-8 grid size-11 place-items-center rounded-xl bg-card text-accent-foreground dark:bg-muted">
                <FileQuestion aria-hidden="true" className="size-5" />
              </div>
              <h2 className="text-xl font-bold">Vẫn cần người hỗ trợ?</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Chuyển câu hỏi chưa được giải quyết thành yêu cầu hỗ trợ mà
                không làm mất ngữ cảnh.
              </p>
              <Button asChild className="mt-5" variant="outline">
                <Link to={ROUTES.tickets}>Mở yêu cầu của tôi</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
