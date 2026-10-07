import {
  HelpCircle,
  Home,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Search,
  SquarePen,
  Trash2,
  UserRound,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { BrandMark } from "@/components/shared/brand/brand-mark"
import { UserAvatar } from "@/components/shared/navigation/user-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ROUTES } from "@/constants/paths"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { useAuth } from "@/features/auth/hooks/use-auth"
import type { Conversation } from "@/features/chat/schemas/chat-schemas"
import { ChangePasswordDialog } from "@/features/profile/components/change-password-dialog"
import { cn } from "@/lib/utils"

export type ConversationHistoryProps = {
  activeConversationId: string | null
  conversations: Conversation[]
  onClose?: () => void
  onDeleteConversation: (id: string) => void
  onNewConversation: () => void
  onOpenSearch: () => void
  onSelectConversation: (id: string) => void
}

type CollapsedHistoryRailProps = {
  activeConversationId: string | null
  onExpand: () => void
  onNewConversation: () => void
  onOpenSearch: () => void
}

export function CollapsedHistoryRail({
  activeConversationId,
  onExpand,
  onNewConversation,
  onOpenSearch,
}: CollapsedHistoryRailProps) {
  const { session, status } = useAuth()
  const navigate = useNavigate()
  const isGuest = status === "unauthenticated"

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-full min-h-0 flex-col items-center justify-between py-3">
        {/* Top action icons (Exact ChatGPT collapsed rail with hover morph) */}
        <div className="flex flex-col items-center gap-2">
          {/* Logo morphs to PanelLeftOpen on hover with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Mở thanh bên"
                className="group relative size-9 cursor-pointer rounded-xl text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                onClick={onExpand}
                size="icon"
                variant="ghost"
              >
                <BrandMark className="size-6 transition-transform duration-150 group-hover:hidden" />
                <PanelLeftOpen
                  aria-hidden="true"
                  className="hidden size-5 text-foreground group-hover:block"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className="rounded-full px-3.5 py-1.5 text-xs font-medium shadow-xl"
              side="right"
              sideOffset={8}
            >
              <span>Mở thanh bên</span>
            </TooltipContent>
          </Tooltip>

          {/* New Chat with Shortcut Badge (Active when on new chat page) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                {...tourAnchor(TOUR_ANCHORS.chatNewConversation)}
                aria-label="Đoạn chat mới (Ctrl + Shift + O)"
                className={cn(
                  "size-9 cursor-pointer rounded-xl transition-colors",
                  !activeConversationId
                    ? "bg-neutral-200/80 text-foreground hover:bg-neutral-200/90 dark:bg-neutral-800/80 dark:text-white dark:hover:bg-neutral-800"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
                onClick={onNewConversation}
                size="icon"
                variant="ghost"
              >
                <SquarePen aria-hidden="true" className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-xl"
              side="right"
              sideOffset={8}
            >
              <span>Đoạn chat mới</span>
              <kbd className="rounded-full bg-background/20 px-2 py-0.5 text-[10px] font-semibold text-background/80">
                Ctrl + Shift + O
              </kbd>
            </TooltipContent>
          </Tooltip>

          {/* Search opens ChatGPT-style Search Dialog with Shortcut Badge */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                {...tourAnchor(TOUR_ANCHORS.chatSearch)}
                aria-label="Tìm kiếm (Ctrl + K)"
                className="size-9 cursor-pointer rounded-xl text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                onClick={onOpenSearch}
                size="icon"
                variant="ghost"
              >
                <Search aria-hidden="true" className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-xl"
              side="right"
              sideOffset={8}
            >
              <span>Tìm kiếm</span>
              <kbd className="rounded-full bg-background/20 px-2 py-0.5 text-[10px] font-semibold text-background/80">
                Ctrl + K
              </kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Bottom User Avatar with Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              {...tourAnchor(
                isGuest
                  ? TOUR_ANCHORS.chatGuestSignIn
                  : TOUR_ANCHORS.chatAccount
              )}
              aria-label={isGuest ? "Đăng nhập" : "Tài khoản người dùng"}
              className={cn(
                "size-9 cursor-pointer p-0",
                isGuest
                  ? "rounded-xl text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  : "rounded-full"
              )}
              onClick={isGuest ? () => void navigate(ROUTES.signIn) : onExpand}
              size="icon"
              variant="ghost"
            >
              {isGuest ? (
                <LogIn aria-hidden="true" className="size-5" />
              ) : (
                <UserAvatar
                  avatarUrl={session?.avatarUrl}
                  className="size-7"
                  fullName={session?.fullName}
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent
            className="rounded-full px-3.5 py-1.5 text-xs font-medium shadow-xl"
            side="right"
            sideOffset={8}
          >
            <span>
              {isGuest ? "Đăng nhập" : (session?.fullName ?? "Tài khoản")}
            </span>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

export function ConversationHistory({
  activeConversationId,
  conversations,
  onClose,
  onDeleteConversation,
  onNewConversation,
  onOpenSearch,
  onSelectConversation,
}: ConversationHistoryProps) {
  const { logout, session, status } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const isGuest = status === "unauthenticated"

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      await navigate(ROUTES.signIn, { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-muted/40 dark:bg-muted/15">
      {/* Top Header: Brand + Search dialog trigger + Close (Unified 10px container padding, 8px inner padding) */}
      <div className="flex h-14 shrink-0 items-center justify-between px-2.5">
        <Link
          aria-label="Trang chủ UniSage"
          className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
          to={ROUTES.home}
        >
          <BrandMark className="size-6 shrink-0" />
          <span className="text-base font-bold tracking-tight text-foreground">
            UniSage
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          <Button
            {...tourAnchor(TOUR_ANCHORS.chatSearch)}
            aria-label="Tìm kiếm cuộc trò chuyện (Ctrl+K)"
            className="size-8 cursor-pointer rounded-lg text-muted-foreground hover:text-foreground"
            onClick={onOpenSearch}
            size="icon"
            variant="ghost"
          >
            <Search aria-hidden="true" className="size-4" />
          </Button>

          {onClose ? (
            <Button
              aria-label="Thu gọn thanh bên"
              className="size-8 cursor-pointer rounded-lg text-muted-foreground hover:text-foreground"
              onClick={onClose}
              size="icon"
              variant="ghost"
            >
              <PanelLeftClose aria-hidden="true" className="size-5" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* New chat button (Exact same 10px container, 8px inner padding) */}
      <div className="shrink-0 px-2.5 py-1">
        <Button
          {...tourAnchor(TOUR_ANCHORS.chatNewConversation)}
          className={cn(
            "h-10 w-full cursor-pointer justify-start gap-2.5 rounded-xl px-2 text-sm font-medium transition-colors",
            !activeConversationId
              ? "bg-neutral-200/80 font-medium text-foreground hover:bg-neutral-200/90 dark:bg-neutral-800/80 dark:text-white dark:hover:bg-neutral-800"
              : "text-foreground/80 hover:bg-neutral-200/50 hover:text-foreground dark:text-neutral-300 dark:hover:bg-neutral-800/50 dark:hover:text-white"
          )}
          onClick={onNewConversation}
          variant="ghost"
        >
          <SquarePen aria-hidden="true" className="size-5 shrink-0" />
          <span>Đoạn chat mới</span>
        </Button>
      </div>

      {/* Conversations list - only this section scrolls */}
      <ScrollArea
        {...tourAnchor(TOUR_ANCHORS.chatHistory)}
        className="min-h-0 flex-1 overflow-hidden"
      >
        <div className="w-full min-w-0 px-2.5 py-2">
          <div className="mb-2 px-2 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase dark:text-neutral-400">
            Gần đây
          </div>
          {conversations.length ? (
            <div className="min-w-0 space-y-0.5">
              {conversations.map((conversation) => (
                <div
                  className={cn(
                    "group flex w-full max-w-full min-w-0 items-center overflow-hidden rounded-xl transition-colors",
                    conversation.id === activeConversationId
                      ? "bg-neutral-200/80 font-medium text-foreground hover:bg-neutral-200/90 dark:bg-neutral-800/80 dark:text-white dark:hover:bg-neutral-800"
                      : "text-foreground/80 hover:bg-neutral-200/50 hover:text-foreground dark:text-neutral-300 dark:hover:bg-neutral-800/50 dark:hover:text-white"
                  )}
                  key={conversation.id}
                >
                  <button
                    className="min-w-0 flex-1 cursor-pointer overflow-hidden px-2 py-2 text-left"
                    onClick={() => onSelectConversation(conversation.id)}
                    type="button"
                  >
                    <span className="block truncate text-sm">
                      {conversation.title}
                    </span>
                  </button>

                  {/* Actions (Pin & More options) only visible on hover/focus */}
                  <div className="flex items-center gap-0.5 pr-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <button
                      aria-label={`Ghim ${conversation.title}`}
                      className="cursor-pointer p-1 text-muted-foreground transition-colors hover:bg-transparent! hover:text-foreground dark:text-neutral-400 dark:hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      type="button"
                    >
                      <Pin aria-hidden="true" className="size-3.5" />
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          aria-label={`Tùy chọn cho ${conversation.title}`}
                          className="cursor-pointer p-1 text-muted-foreground transition-colors hover:bg-transparent! hover:text-foreground dark:text-neutral-400 dark:hover:text-white"
                          type="button"
                        >
                          <MoreHorizontal
                            aria-hidden="true"
                            className="size-3.5"
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onSelect={() => onDeleteConversation(conversation.id)}
                          variant="destructive"
                        >
                          <Trash2 aria-hidden="true" />
                          Xóa đoạn chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-2 rounded-xl border border-dashed py-6 text-center">
              <Search
                aria-hidden="true"
                className="mx-auto mb-1.5 size-4 text-muted-foreground"
              />
              <p className="text-xs font-medium text-muted-foreground">
                Chưa có đoạn chat nào
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom User Account Menu (Exact same 10px container, 8px inner padding) */}
      <div className="shrink-0 border-t border-border/40 p-2.5">
        {isGuest ? (
          <div
            {...tourAnchor(TOUR_ANCHORS.chatGuestSignIn)}
            className="rounded-xl bg-background/60 p-3 dark:bg-muted/40"
          >
            <p className="text-sm font-semibold text-foreground">
              Đăng nhập để có trải nghiệm đầy đủ
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Đăng nhập để lưu lịch sử trò chuyện và xem nguồn tài liệu tham
              khảo chi tiết cho từng câu trả lời.
            </p>
            <Button
              className="mt-3 w-full cursor-pointer rounded-full"
              onClick={() => void navigate(ROUTES.signIn)}
              size="sm"
            >
              Đăng nhập
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                {...tourAnchor(TOUR_ANCHORS.chatAccount)}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-background/80 focus-visible:outline-2 focus-visible:outline-primary dark:hover:bg-muted/50"
                type="button"
              >
                <UserAvatar
                  avatarUrl={session?.avatarUrl}
                  className="size-7 shrink-0"
                  fullName={session?.fullName}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground dark:text-neutral-100">
                    {session?.fullName ?? "Người dùng"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60" side="top">
              <DropdownMenuLabel className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {session?.fullName ?? "Người dùng"}
                </p>
                <p className="truncate text-xs font-normal text-muted-foreground">
                  {session?.email}
                </p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onSelect={() => navigate(ROUTES.home)}>
                <Home aria-hidden="true" />
                Trang chủ
              </DropdownMenuItem>
              {/* Only system-role accounts can open the admin workspace. */}
              {session?.isSystemRole ? (
                <DropdownMenuItem onSelect={() => navigate(ROUTES.admin)}>
                  <LayoutDashboard aria-hidden="true" />
                  Trang quản trị
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onSelect={() => navigate(ROUTES.tickets)}>
                <HelpCircle aria-hidden="true" />
                Yêu cầu hỗ trợ
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onSelect={() => navigate(ROUTES.profile)}>
                <UserRound aria-hidden="true" />
                Thông tin cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsPasswordDialogOpen(true)}>
                <KeyRound aria-hidden="true" />
                Đổi mật khẩu
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                disabled={isLoggingOut}
                onSelect={() => void handleLogout()}
                variant="destructive"
              >
                <LogOut aria-hidden="true" />
                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <ChangePasswordDialog
        onOpenChange={setIsPasswordDialogOpen}
        open={isPasswordDialogOpen}
      />
    </div>
  )
}
