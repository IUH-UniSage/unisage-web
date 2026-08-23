import { PanelLeftOpen, Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

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
import { CHAT_SOURCES } from "@/features/chat/chat-data"
import type { Conversation } from "@/features/chat/schemas/chat-schemas"

type MobileChatHeaderProps = {
  historyContent: ReactNode
}

export function MobileChatHeader({ historyContent }: MobileChatHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center border-b bg-card px-2.5 xl:hidden dark:border-white/[0.06]">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            aria-label="Mở lịch sử trò chuyện"
            size="icon"
            variant="ghost"
          >
            <PanelLeftOpen aria-hidden="true" className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[88vw] max-w-[320px] gap-0 p-0" side="left">
          <SheetHeader className="sr-only">
            <SheetTitle>Lịch sử trò chuyện</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1">{historyContent}</div>
        </SheetContent>
      </Sheet>

      <Link
        aria-label="Trang chủ UniSage"
        className="ml-2 flex items-center gap-2 rounded-lg"
        to={ROUTES.home}
      >
        <BrandMark className="size-7" />
        <span className="text-base font-bold tracking-tight text-foreground">
          UniSage
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  )
}

type DesktopChatHeaderProps = {
  activeConversation: Conversation | null
  isSourcesOpen: boolean
  onOpenSources: () => void
}

export function DesktopChatHeader({
  activeConversation,
  isSourcesOpen,
  onOpenSources,
}: DesktopChatHeaderProps) {
  return (
    <header className="hidden h-14 shrink-0 items-center justify-end px-4 xl:flex">
      {/* Right actions: Open Sources button (when closed) + ThemeToggle (no ... icon) */}
      <div className="flex items-center gap-2">
        {!isSourcesOpen && activeConversation ? (
          <Button
            aria-label="Mở nguồn tham chiếu"
            className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onOpenSources}
            size="sm"
            variant="ghost"
          >
            <Sparkles className="size-3.5 text-knowledge" />
            <span>Nguồn tham chiếu</span>
            <Badge className="ml-0.5 size-4 justify-center rounded-full bg-muted p-0 text-[10px] leading-none text-muted-foreground">
              {CHAT_SOURCES.length}
            </Badge>
          </Button>
        ) : null}

        <ThemeToggle />
      </div>
    </header>
  )
}
