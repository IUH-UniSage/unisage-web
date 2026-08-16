import { Bell, Menu } from "lucide-react"
import { Outlet } from "react-router-dom"

import {
  StaffSidebar,
  type StaffWorkspace,
} from "@/components/shared/navigation/staff-sidebar"
import { SearchAndActions } from "@/components/shared/search-and-actions"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { getInitials } from "@/features/auth/lib/auth-session"

type StaffWorkspaceLayoutProps = {
  workspace: StaffWorkspace
}

export function StaffWorkspaceLayout({ workspace }: StaffWorkspaceLayoutProps) {
  const { session } = useAuth()
  const workspaceLabel =
    workspace === "ingester" ? "Nạp tài liệu" : "Quản trị hệ thống"

  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[248px_1fr]">
      <StaffSidebar
        className="fixed inset-y-0 left-0 hidden lg:flex"
        workspace={workspace}
      />

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b bg-card px-4 md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                aria-label="Mở điều hướng"
                className="lg:hidden"
                size="icon"
                variant="outline"
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[248px] border-0 p-0" side="left">
              <SheetHeader className="sr-only">
                <SheetTitle>Điều hướng {workspaceLabel}</SheetTitle>
              </SheetHeader>
              <StaffSidebar workspace={workspace} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">
              Không gian làm việc
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {workspaceLabel}
            </p>
          </div>

          <SearchAndActions
            className="hidden w-full max-w-xs md:flex"
            inputClassName="bg-background"
            placeholder="Tìm trong không gian làm việc"
          />
          <ThemeToggle />
          <Button aria-label="Thông báo" size="icon" variant="ghost">
            <Bell aria-hidden="true" />
          </Button>
          <Avatar className="size-9">
            {session?.avatarUrl ? (
              <AvatarImage
                alt=""
                referrerPolicy="no-referrer"
                src={session.avatarUrl}
              />
            ) : null}
            <AvatarFallback className="bg-secondary text-xs font-semibold text-primary">
              {session ? getInitials(session.fullName) : "US"}
            </AvatarFallback>
          </Avatar>
        </header>

        <main className="mx-auto w-full max-w-[1440px] p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
