import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Clock3,
  Copy,
  FileText,
  History,
  MessageSquarePlus,
  MoreHorizontal,
  Paperclip,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  Pin,
  PinOff,
  Search,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { BrandLogo } from "@/components/shared/brand/brand-logo"
import { BrandMark } from "@/components/shared/brand/brand-mark"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ROUTES } from "@/constants/paths"
import { cn } from "@/lib/utils"

type Conversation = {
  date: string
  id: string
  pinned: boolean
  title: string
}

const initialConversations: Conversation[] = [
  {
    date: "Hôm nay",
    id: "graduation-requirements",
    pinned: false,
    title: "Điều kiện tốt nghiệp ngành Công nghệ thông tin",
  },
  {
    date: "Hôm nay",
    id: "course-retake",
    pinned: false,
    title: "Đăng ký học lại học phần",
  },
  {
    date: "Hôm qua",
    id: "student-health-insurance",
    pinned: false,
    title: "Bảo hiểm y tế sinh viên",
  },
  {
    date: "22/07",
    id: "tuition-extension",
    pinned: false,
    title: "Gia hạn đóng học phí",
  },
]

const sources = [
  {
    meta: "Quyết định 1540/QĐ-ĐHCN · 2025",
    title: "Quy chế đào tạo đại học",
  },
  {
    meta: "Mục 4.2 · Cập nhật tháng 02/2026",
    title: "Sổ tay Khoa Công nghệ thông tin",
  },
  {
    meta: "Phòng Đào tạo",
    title: "Quy trình xét tốt nghiệp",
  },
]

type ConversationHistoryProps = {
  activeConversationId: string | null
  conversations: Conversation[]
  onDeleteConversation: (id: string) => void
  onNewConversation: () => void
  onRenameConversation: (id: string, title: string) => void
  onSelectConversation: (id: string) => void
  onTogglePinConversation: (id: string) => void
  searchLabel: string
  searchQuery: string
  setSearchQuery: (value: string) => void
}

function ConversationHistory({
  activeConversationId,
  conversations,
  onDeleteConversation,
  onNewConversation,
  onRenameConversation,
  onSelectConversation,
  onTogglePinConversation,
  searchLabel,
  searchQuery,
  setSearchQuery,
}: ConversationHistoryProps) {
  const [editingConversationId, setEditingConversationId] = useState<
    string | null
  >(null)
  const [draftTitle, setDraftTitle] = useState("")
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("vi")
  const filteredConversations = conversations
    .filter((conversation) =>
      conversation.title.toLocaleLowerCase("vi").includes(normalizedQuery)
    )
    .sort((left, right) => Number(right.pinned) - Number(left.pinned))

  const finishRenaming = () => {
    if (!editingConversationId) return

    const nextTitle = draftTitle.trim()
    if (nextTitle) {
      onRenameConversation(editingConversationId, nextTitle)
    }

    setEditingConversationId(null)
    setDraftTitle("")
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 p-4">
        <Button className="w-full justify-start" onClick={onNewConversation}>
          <MessageSquarePlus aria-hidden="true" />
          Cuộc trò chuyện mới
        </Button>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label={searchLabel}
            className="h-9 bg-card pr-9 pl-9 dark:border-transparent dark:bg-muted"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm cuộc trò chuyện..."
            value={searchQuery}
          />
          {searchQuery ? (
            <Button
              aria-label="Xóa nội dung tìm kiếm"
              className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
      <Separator />
      <ScrollArea className="min-h-0 flex-1">
        <div className="w-full min-w-0 overflow-hidden px-3 py-4">
          <div className="mb-3 flex items-center gap-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <History aria-hidden="true" className="size-3.5" />
            Gần đây
          </div>
          {filteredConversations.length ? (
            <div className="min-w-0 space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  className={cn(
                    "group flex w-full max-w-full min-w-0 items-center overflow-hidden rounded-lg transition-colors",
                    conversation.id === activeConversationId
                      ? "bg-secondary text-primary dark:text-secondary-foreground"
                      : "hover:bg-muted"
                  )}
                  key={conversation.id}
                >
                  {editingConversationId === conversation.id ? (
                    <div className="min-w-0 flex-1 px-2 py-2">
                      <Input
                        aria-label={`Đổi tên ${conversation.title}`}
                        autoFocus
                        className="h-8 bg-card"
                        onBlur={() => {
                          setEditingConversationId(null)
                          setDraftTitle("")
                        }}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault()
                            finishRenaming()
                          }

                          if (event.key === "Escape") {
                            setEditingConversationId(null)
                            setDraftTitle("")
                          }
                        }}
                        value={draftTitle}
                      />
                    </div>
                  ) : (
                    <button
                      className="min-w-0 flex-1 overflow-hidden px-3 py-3 text-left"
                      onClick={() => onSelectConversation(conversation.id)}
                      type="button"
                    >
                      <span className="block truncate text-sm leading-5 font-medium">
                        {conversation.title}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {conversation.pinned ? (
                          <Pin aria-hidden="true" className="size-3" />
                        ) : null}
                        {conversation.date}
                      </span>
                    </button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label={`Tùy chọn cho ${conversation.title}`}
                        className="mr-1 opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
                        size="icon-sm"
                        variant="ghost"
                      >
                        <MoreHorizontal aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onSelect={() => {
                          setEditingConversationId(conversation.id)
                          setDraftTitle(conversation.title)
                        }}
                      >
                        <Pencil aria-hidden="true" />
                        Đổi tên
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          onTogglePinConversation(conversation.id)
                        }
                      >
                        {conversation.pinned ? (
                          <PinOff aria-hidden="true" />
                        ) : (
                          <Pin aria-hidden="true" />
                        )}
                        {conversation.pinned
                          ? "Bỏ ghim"
                          : "Ghim cuộc trò chuyện"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => onDeleteConversation(conversation.id)}
                        variant="destructive"
                      >
                        <Trash2 aria-hidden="true" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-2 rounded-lg border border-dashed px-3 py-6 text-center">
              <Search
                aria-hidden="true"
                className="mx-auto mb-2 size-5 text-muted-foreground"
              />
              <p className="text-sm font-medium">Không tìm thấy hội thoại</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Thử tìm bằng từ khóa khác.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="shrink-0 border-t p-4">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 aria-hidden="true" className="size-3.5" />
          Lịch sử được lưu trong 90 ngày
        </p>
      </div>
    </div>
  )
}

function ChatComposer({ centered = false }: { centered?: boolean }) {
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

export function ChatPage() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const [isSourcesOpen, setIsSourcesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [conversationItems, setConversationItems] =
    useState(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null)
  const activeConversation =
    conversationItems.find(
      (conversation) => conversation.id === activeConversationId
    ) ?? null

  const handleNewConversation = () => {
    setActiveConversationId(null)
    setIsSourcesOpen(false)
    setSearchQuery("")
  }

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id)
    setIsSourcesOpen(true)
  }

  const handleRenameConversation = (id: string, title: string) => {
    setConversationItems((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, title } : conversation
      )
    )
  }

  const handleTogglePinConversation = (id: string) => {
    setConversationItems((current) =>
      current.map((conversation) =>
        conversation.id === id
          ? { ...conversation, pinned: !conversation.pinned }
          : conversation
      )
    )
  }

  const handleDeleteConversation = (id: string) => {
    setConversationItems((current) =>
      current.filter((conversation) => conversation.id !== id)
    )

    if (activeConversationId === id) {
      setActiveConversationId(null)
      setIsSourcesOpen(false)
    }
  }

  const desktopGridClass =
    isHistoryOpen && isSourcesOpen
      ? "xl:grid-cols-[280px_minmax(0,1fr)_320px]"
      : isHistoryOpen
        ? "xl:grid-cols-[280px_minmax(0,1fr)]"
        : isSourcesOpen
          ? "xl:grid-cols-[minmax(0,1fr)_320px]"
          : "xl:grid-cols-[minmax(0,1fr)]"

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center border-b bg-card px-2.5 xl:hidden dark:border-white/[0.06]">
        <Button
          asChild
          aria-label="Về trang chủ"
          size="icon-sm"
          variant="ghost"
        >
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
              <div className="min-h-0 flex-1">
                <ConversationHistory
                  activeConversationId={activeConversationId}
                  conversations={conversationItems}
                  onDeleteConversation={handleDeleteConversation}
                  onNewConversation={handleNewConversation}
                  onRenameConversation={handleRenameConversation}
                  onSelectConversation={handleSelectConversation}
                  onTogglePinConversation={handleTogglePinConversation}
                  searchLabel="Tìm kiếm lịch sử trò chuyện"
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
            </SheetContent>
          </Sheet>
          <ThemeToggle />
        </div>
      </header>

      <header
        className={cn(
          "hidden h-16 shrink-0 border-b bg-card xl:grid dark:border-white/[0.06]",
          desktopGridClass
        )}
      >
        {isHistoryOpen ? (
          <div className="flex items-center gap-1 border-r px-3">
            <Button
              asChild
              aria-label="Về trang chủ"
              size="icon"
              variant="ghost"
            >
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
            onClick={() => setIsHistoryOpen((current) => !current)}
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
                  onClick={() => setIsSourcesOpen(true)}
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
              {sources.length}
            </Badge>
            <Button
              aria-label="Ẩn nguồn tham chiếu"
              onClick={() => setIsSourcesOpen(false)}
              size="icon"
              variant="ghost"
            >
              <PanelRightClose aria-hidden="true" />
            </Button>
            <ThemeToggle />
          </div>
        ) : null}
      </header>

      <div
        className={cn(
          "grid min-h-0 flex-1 transition-[grid-template-columns]",
          desktopGridClass
        )}
      >
        {isHistoryOpen ? (
          <aside className="hidden min-h-0 border-r bg-muted/30 xl:block dark:border-white/[0.06] dark:bg-card">
            <ConversationHistory
              activeConversationId={activeConversationId}
              conversations={conversationItems}
              onDeleteConversation={handleDeleteConversation}
              onNewConversation={handleNewConversation}
              onRenameConversation={handleRenameConversation}
              onSelectConversation={handleSelectConversation}
              onTogglePinConversation={handleTogglePinConversation}
              searchLabel="Tìm kiếm cuộc trò chuyện"
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </aside>
        ) : null}

        <section className="flex min-h-0 min-w-0 flex-col bg-background">
          {activeConversation ? (
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
                          Sinh viên ngành Công nghệ thông tin cần hoàn thành
                          chương trình đào tạo, đạt GPA tích lũy theo quy định,
                          đáp ứng chuẩn ngoại ngữ và tin học, đồng thời không
                          còn nghĩa vụ kỷ luật hoặc tài chính chưa hoàn tất.
                        </p>
                        <div className="rounded-xl border-l-4 border-l-knowledge bg-accent px-4 py-3">
                          <p className="font-semibold text-accent-foreground">
                            Kiểm tra khóa đào tạo của bạn
                          </p>
                          <p className="mt-1 text-xs leading-5 text-accent-foreground/80">
                            Tổng số tín chỉ và nhóm môn tự chọn có thể khác theo
                            từng năm chương trình. Hãy kiểm tra khóa của bạn
                            trên cổng sinh viên.
                          </p>
                        </div>
                        <ol className="list-decimal space-y-2 pl-5">
                          <li>
                            Hoàn thành các nhóm tín chỉ bắt buộc và tự chọn.
                          </li>
                          <li>Đạt GPA tích lũy theo quy định hiện hành.</li>
                          <li>Đạt chuẩn ngoại ngữ và năng lực số bắt buộc.</li>
                          <li>
                            Nộp hồ sơ xét tốt nghiệp trước thời hạn công bố.
                          </li>
                        </ol>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        {sources.slice(0, 2).map((source, index) => (
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left text-xs font-medium text-primary hover:bg-secondary dark:text-info"
                            key={source.title}
                            type="button"
                          >
                            <FileText aria-hidden="true" className="size-3.5" />
                            [{index + 1}] {source.title}
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center gap-1 text-muted-foreground">
                        <Button
                          aria-label="Sao chép câu trả lời"
                          onClick={() =>
                            toast.info(
                              "Đây là bản xem trước thao tác sao chép."
                            )
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
          ) : (
            <div className="chat-empty-ambient flex min-h-0 flex-1 flex-col px-4 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:items-center md:justify-center md:py-8">
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center md:flex-none">
                <BrandMark className="size-14 md:size-16" />
                <h2 className="mt-4 text-lg font-semibold tracking-tight md:mt-5 md:text-xl">
                  Bắt đầu cuộc trò chuyện mới
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground md:max-w-md">
                  Đặt câu hỏi về quy định học tập, thủ tục sinh viên hoặc các
                  tài liệu trong thư viện tri thức.
                </p>
              </div>
              <div className="w-full shrink-0 md:mt-8 md:max-w-3xl">
                <ChatComposer centered />
              </div>
            </div>
          )}
        </section>

        {isSourcesOpen ? (
          <aside className="hidden min-h-0 border-l bg-muted/30 xl:block dark:border-white/[0.06] dark:bg-card">
            <ScrollArea className="h-full">
              <div className="space-y-3 p-4">
                {sources.map((source, index) => (
                  <button
                    className="group w-full rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/25 dark:border-white/[0.06] dark:bg-muted/45"
                    key={source.title}
                    type="button"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="grid size-8 place-items-center rounded-lg bg-secondary text-xs font-bold text-primary dark:text-info">
                        {index + 1}
                      </div>
                      <ChevronRight
                        aria-hidden="true"
                        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                    <p className="line-clamp-2 text-sm leading-5 font-semibold break-words">
                      {source.title}
                    </p>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 break-words text-muted-foreground">
                      {source.meta}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
