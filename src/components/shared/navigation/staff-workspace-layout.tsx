import { Bell, Menu } from "lucide-react"
import { Outlet } from "react-router-dom"

import {
  StaffSidebar,
  type StaffWorkspace,
} from "@/components/shared/navigation/staff-sidebar"
import { SearchAndActions } from "@/components/shared/list/search-and-actions"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { UserAccountMenu } from "@/components/shared/navigation/user-account-menu"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type StaffWorkspaceLayoutProps = {
  workspace: StaffWorkspace
}

export function StaffWorkspaceLayout({ workspace }: StaffWorkspaceLayoutProps) {
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

            <SearchAndActions
              className="hidden w-full max-w-xs md:flex"
              inputClassName="bg-background"
              placeholder="Tìm trong không gian làm việc"
            />
            <ThemeToggle />
            <Button aria-label="Thông báo" size="icon" variant="ghost">
              <Bell aria-hidden="true" />
            </Button>
            <UserAccountMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] p-4 md:px-6 md:py-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
