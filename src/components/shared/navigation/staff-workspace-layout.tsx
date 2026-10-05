import { Bell, Menu, Search, X } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"
import { Outlet } from "react-router-dom"

import {
  StaffSidebar,
  type StaffWorkspace,
} from "@/components/shared/navigation/staff-sidebar"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { UserAccountMenu } from "@/components/shared/navigation/user-account-menu"
import { WorkspaceSearch } from "@/components/shared/navigation/workspace-search"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type StaffWorkspaceLayoutProps = {
  banner?: ReactNode
  workspace: StaffWorkspace
}

export function StaffWorkspaceLayout({
  banner,
  workspace,
}: StaffWorkspaceLayoutProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const workspaceLabel =
    workspace === "ingester" ? "Nạp tài liệu" : "Quản trị hệ thống"

  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[248px_1fr]">
      <StaffSidebar
        className="fixed inset-y-0 left-0 hidden lg:flex"
        workspace={workspace}
      />

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-30 border-b bg-card">
          <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-3 px-4 md:px-6">
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

            <WorkspaceSearch
              className="hidden w-full max-w-xs md:block"
              workspace={workspace}
            />
            <Button
              aria-expanded={isMobileSearchOpen}
              aria-label={isMobileSearchOpen ? "Đóng tìm kiếm" : "Tìm kiếm"}
              className="md:hidden"
              onClick={() => setIsMobileSearchOpen((open) => !open)}
              size="icon"
              variant="ghost"
            >
              {isMobileSearchOpen ? (
                <X aria-hidden="true" />
              ) : (
                <Search aria-hidden="true" />
              )}
            </Button>
            <ThemeToggle />
            <Button aria-label="Thông báo" size="icon" variant="ghost">
              <Bell aria-hidden="true" />
            </Button>
            <UserAccountMenu />
          </div>
          {isMobileSearchOpen ? (
            <div className="px-4 pb-3 md:hidden">
              <WorkspaceSearch
                autoFocus
                onNavigate={() => setIsMobileSearchOpen(false)}
                workspace={workspace}
              />
            </div>
          ) : null}
        </header>

        <main className="mx-auto w-full max-w-[1440px] p-4 md:px-6 md:py-4">
          {banner}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
