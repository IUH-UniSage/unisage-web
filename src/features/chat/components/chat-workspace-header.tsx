import {
  ArrowLeft,
  BookOpen,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
} from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { BrandLogo } from "@/components/shared/brand/brand-logo"
import { BrandMark } from "@/components/shared/brand/brand-mark"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ROUTES } from "@/constants/paths"
import { CHAT_SOURCES, type Conversation } from "@/features/chat/chat-data"
import { cn } from "@/lib/utils"

type MobileChatHeaderProps = {
  historyContent: ReactNode
}

export function MobileChatHeader({ historyContent }: MobileChatHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center border-b bg-card px-2.5 xl:hidden dark:border-white/[0.06]">
      <Button asChild aria-label="Về trang chủ" size="icon-sm" variant="ghost">
        <Link to={ROUTES.home}>
          <ArrowLeft aria-hidden="true" />
        </Link>
      </Button>
      <Link
        aria-label="Trang chủ UniSage"
        className="ml-1 flex items-center gap-2 rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
        to={ROUTES.home}
      >
        <BrandMark className="size-8" />
        <span className="text-base font-bold tracking-tight text-primary dark:text-white">
          UniSage
        </span>
      </Link>
      <div className="ml-auto flex items-center gap-1">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              aria-label="Mở lịch sử trò chuyện"
              size="icon"
              variant="ghost"
            >
              <PanelLeftOpen aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="w-[88vw] max-w-[340px] gap-0 p-0"
            side="left"
          >
            <SheetHeader className="flex-row items-center gap-3 border-b px-4 py-4">
              <BrandMark className="size-8" />
              <SheetTitle>Lịch sử trò chuyện</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1">{historyContent}</div>
          </SheetContent>
        </Sheet>
        <ThemeToggle />
      </div>
    </header>
  )
}

type DesktopChatHeaderProps = {
  activeConversation: Conversation | null
  desktopGridClass: string
  isHistoryOpen: boolean
  isSourcesOpen: boolean
  onCloseSources: () => void
  onOpenSources: () => void
  onToggleHistory: () => void
}

export function DesktopChatHeader({
  activeConversation,
  desktopGridClass,
  isHistoryOpen,
  isSourcesOpen,
  onCloseSources,
  onOpenSources,
  onToggleHistory,
}: DesktopChatHeaderProps) {
  return (
    <header
      className={cn(
        "hidden h-16 shrink-0 border-b bg-card xl:grid dark:border-white/[0.06]",
        desktopGridClass
      )}
    >
      {isHistoryOpen ? (
        <div className="flex items-center gap-1 border-r px-3">
          <Button asChild aria-label="Về trang chủ" size="icon" variant="ghost">
            <Link to={ROUTES.home}>
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <Link
            aria-label="Trang chủ UniSage"
            className="rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
            to={ROUTES.home}
          >
            <BrandLogo />
          </Link>
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-w-0 items-center gap-3 px-3",
          isSourcesOpen && "border-r"
        )}
      >
        <Button
          aria-label={
            isHistoryOpen ? "Ẩn lịch sử trò chuyện" : "Mở lịch sử trò chuyện"
          }
          onClick={onToggleHistory}
          size="icon"
          variant="ghost"
        >
          {isHistoryOpen ? (
            <PanelLeftClose aria-hidden="true" />
          ) : (
            <PanelLeftOpen aria-hidden="true" />
          )}
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">
            {activeConversation?.title ?? "Cuộc trò chuyện mới"}
          </h1>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {activeConversation
              ? "Bản xem trước · câu trả lời cần được kiểm chứng"
              : "Đặt câu hỏi để bắt đầu với UniSage"}
          </p>
        </div>
        {activeConversation ? (
          <Badge className="hidden bg-secondary text-primary hover:bg-secondary 2xl:inline-flex dark:text-secondary-foreground">
            <Sparkles aria-hidden="true" className="text-knowledge" />
            Có nguồn tham chiếu
          </Badge>
        ) : null}
        {!isSourcesOpen ? (
          <>
            {activeConversation ? (
              <Button
                aria-label="Mở nguồn tham chiếu"
                onClick={onOpenSources}
                size="icon"
                variant="ghost"
              >
                <PanelRightOpen aria-hidden="true" />
              </Button>
            ) : null}
            <ThemeToggle />
          </>
        ) : null}
        <Button
          aria-label="Tùy chọn cuộc trò chuyện"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </div>

      {isSourcesOpen ? (
        <div className="flex items-center gap-2 px-4">
          <BookOpen
            aria-hidden="true"
            className="size-4 text-primary dark:text-info"
          />
          <h2 className="text-sm font-semibold">Nguồn tham chiếu</h2>
          <Badge className="ml-auto" variant="secondary">
            {CHAT_SOURCES.length}
          </Badge>
          <Button
            aria-label="Ẩn nguồn tham chiếu"
            onClick={onCloseSources}
            size="icon"
            variant="ghost"
          >
            <PanelRightClose aria-hidden="true" />
          </Button>
          <ThemeToggle />
        </div>
      ) : null}
    </header>
  )
}
