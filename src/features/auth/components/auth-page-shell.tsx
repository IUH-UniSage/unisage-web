import type { PropsWithChildren } from "react"
import { BookOpenCheck, GraduationCap, ShieldCheck } from "lucide-react"

import { BrandLogo } from "@/components/shared/brand/brand-logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { cn } from "@/lib/utils"

const highlights = [
  {
    icon: BookOpenCheck,
    text: "Câu trả lời dựa trên tài liệu chính thức đã kiểm chứng",
  },
  {
    icon: ShieldCheck,
    text: "Nguồn tri thức phù hợp với từng vai trò học thuật",
  },
  {
    icon: GraduationCap,
    text: "Một không gian chung cho học tập và hỗ trợ sinh viên",
  },
]

type AuthPageShellProps = PropsWithChildren<{
  contentClassName?: string
}>

export function AuthPageShell({
  children,
  contentClassName,
}: AuthPageShellProps) {
  return (
    <main className="grid min-h-svh bg-background lg:h-svh lg:min-h-0 lg:grid-cols-2 lg:overflow-hidden">
      <section className="knowledge-network relative hidden h-svh min-h-0 overflow-hidden bg-hero px-12 py-8 text-white lg:flex lg:flex-col xl:px-16 2xl:px-20">
        <div className="absolute bottom-[-9rem] -left-24 size-[30rem] rounded-full border border-white/10" />
        <div className="absolute bottom-[-4rem] -left-10 size-[20rem] rounded-full border border-white/10" />
        <div className="absolute top-16 right-[-6rem] size-72 rotate-12 rounded-[4rem] border border-white/10" />

        <BrandLogo
          className="relative z-10"
          inverse
          workspace="Trợ lý học thuật"
        />

        <div className="relative z-10 my-auto max-w-2xl py-7 [@media(max-height:760px)]:py-3">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/90">
            <span className="size-2 rounded-full bg-knowledge" />
            Kết nối tri thức toàn trường
          </p>
          <h1 className="text-4xl leading-[1.16] font-bold tracking-tight text-white xl:text-[2.75rem] 2xl:text-5xl [@media(max-height:760px)]:text-3xl">
            Tìm đúng câu trả lời, từ những nguồn bạn có thể tin cậy.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/72 xl:text-base">
            UniSage kết nối quy định, hướng dẫn học vụ và dịch vụ hỗ trợ trong
            một trợ lý đáng tin cậy dành cho cộng đồng nhà trường.
          </p>

          <div className="mt-7 space-y-3.5 [@media(max-height:760px)]:mt-5 [@media(max-height:760px)]:space-y-2">
            {highlights.map((highlight) => {
              const Icon = highlight.icon

              return (
                <div className="flex items-center gap-3.5" key={highlight.text}>
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10">
                    <Icon
                      aria-hidden="true"
                      className="size-[18px] text-info"
                    />
                  </div>
                  <p className="text-sm font-medium text-white/86">
                    {highlight.text}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          Trường Đại học Công nghiệp Thành phố Hồ Chí Minh
        </p>
      </section>

      <section className="relative flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_top_right,#e3f6fd_0,transparent_32%)] px-5 py-8 sm:px-8 lg:h-svh lg:min-h-0 lg:overflow-y-auto lg:py-6 dark:bg-[radial-gradient(circle_at_top_right,#142b4a_0,transparent_36%)]">
        <ThemeToggle className="absolute top-4 right-4 border bg-background/80 shadow-sm backdrop-blur" />
        <div className={cn("w-full max-w-[460px]", contentClassName)}>
          <BrandLogo className="mb-9 lg:hidden" />
          {children}
        </div>
      </section>
    </main>
  )
}
