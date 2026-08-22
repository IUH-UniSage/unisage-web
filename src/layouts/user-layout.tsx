import { Bell, Menu, UserRound } from "lucide-react"
import { Link, Outlet } from "react-router-dom"

import { BrandLogo } from "@/components/shared/brand/brand-logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ROUTES } from "@/constants/paths"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { getInitials } from "@/features/auth/utils/auth-session"

const userNavigation = [
  {
    label: "Trợ lý UniSage",
    to: ROUTES.chat,
  },
  {
    label: "Thư viện tri thức",
    to: ROUTES.knowledge,
  },
  {
    label: "Hỗ trợ sinh viên",
    to: ROUTES.tickets,
  },
]

function UserNavigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav aria-label="Điều hướng người dùng">
      <ul
        className={mobile ? "flex flex-col items-stretch" : "flex items-center"}
      >
        {userNavigation.map((item) => (
          <li key={item.label}>
            <Link
              className={
                mobile
                  ? "flex min-h-14 items-center border-b border-primary/10 px-5 text-[14px] font-semibold text-[#153898] uppercase transition-colors hover:bg-secondary hover:text-primary dark:text-white/82 dark:hover:bg-white/8"
                  : "flex h-11 items-center px-3 text-[14px] font-semibold whitespace-nowrap text-[#153898] uppercase transition-colors hover:bg-[#153898] hover:text-[#f9b200] focus-visible:bg-[#153898] focus-visible:text-[#f9b200] xl:px-4 dark:text-white/82"
              }
              to={item.to}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function UserLayout() {
  const { session } = useAuth()

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 shadow-[0_8px_24px_rgb(21_56_152_/_0.08)]">
        <div className="hidden bg-[#153898] text-white lg:block dark:border-b dark:border-white/[0.05] dark:bg-[#171717]">
          <div className="mx-auto flex h-10 max-w-[1200px] items-center justify-between px-4 text-[11px] font-medium">
            <p className="truncate tracking-[0.02em]">
              Trường Đại học Công nghiệp Thành phố Hồ Chí Minh
            </p>
            <div className="ml-4 flex shrink-0 items-center gap-3 text-white/78">
              <span className="hidden sm:inline">Không gian sinh viên</span>
              <span
                aria-hidden="true"
                className="hidden h-3 w-px bg-white/25 sm:block"
              />
              <span>Trợ lý học thuật</span>
              <span className="rounded-sm border border-white/25 px-1.5 py-0.5 font-semibold text-white">
                VI
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-primary/10 bg-[#153898] lg:bg-card dark:bg-[#171717] lg:dark:border-white/[0.05] lg:dark:bg-card/95 lg:dark:backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-[1200px] items-center px-4">
            <Link
              aria-label="Trang chủ UniSage"
              className="shrink-0 rounded-xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary lg:w-[310px] xl:w-[400px]"
              to={ROUTES.home}
            >
              <BrandLogo
                className="lg:hidden"
                inverse
                workspace="Trợ lý học thuật"
              />
              <BrandLogo
                className="hidden lg:flex"
                size="lg"
                workspace="Trợ lý học thuật"
              />
            </Link>

            <div className="hidden lg:block">
              <UserNavigation />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1">
              <div className="hidden items-center gap-1 lg:flex">
                <ThemeToggle />
                {session ? (
                  <>
                    <Button
                      asChild
                      aria-label="Thông báo"
                      size="icon"
                      variant="ghost"
                    >
                      <Link to={ROUTES.notifications}>
                        <Bell aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="rounded-full p-0"
                      variant="ghost"
                    >
                      <Link aria-label="Mở hồ sơ cá nhân" to={ROUTES.profile}>
                        <Avatar className="size-9">
                          {session.avatarUrl ? (
                            <AvatarImage
                              alt=""
                              referrerPolicy="no-referrer"
                              src={session.avatarUrl}
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                            {getInitials(session.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    </Button>
                    <LogoutButton
                      aria-label="Đăng xuất"
                      label=""
                      size="icon"
                      variant="ghost"
                    />
                  </>
                ) : (
                  <Button asChild size="sm">
                    <Link to={ROUTES.signIn}>Đăng nhập</Link>
                  </Button>
                )}
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    aria-label="Mở điều hướng"
                    className="text-white hover:bg-white/10 hover:text-white lg:hidden"
                    size="icon"
                    variant="ghost"
                  >
                    <Menu aria-hidden="true" className="size-8" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  className="w-[82vw] max-w-[360px] gap-0 border-l-0 p-0"
                  showCloseButton={false}
                  side="right"
                >
                  <SheetHeader className="knowledge-network relative flex h-28 justify-center bg-[linear-gradient(135deg,#153898,#3159c4)] px-5 py-0 text-white">
                    <SheetTitle className="sr-only">
                      Điều hướng người dùng
                    </SheetTitle>
                    <BrandLogo inverse workspace="Trợ lý học thuật" />
                    <SheetClose asChild>
                      <Button
                        aria-label="Đóng điều hướng"
                        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
                        size="icon"
                        variant="ghost"
                      >
                        <span
                          aria-hidden="true"
                          className="text-2xl leading-none"
                        >
                          ×
                        </span>
                      </Button>
                    </SheetClose>
                  </SheetHeader>
                  <div>
                    <UserNavigation mobile />
                  </div>

                  <div className="mt-auto border-t border-primary/10 p-5">
                    {session ? (
                      <>
                        <Link
                          className="flex min-h-11 items-center gap-3 text-sm font-medium text-primary"
                          to={ROUTES.notifications}
                        >
                          <Bell aria-hidden="true" className="size-4" />
                          Thông báo
                        </Link>
                        <Link
                          className="flex min-h-11 items-center gap-3 text-sm font-medium text-primary"
                          to={ROUTES.profile}
                        >
                          <UserRound aria-hidden="true" className="size-4" />
                          Hồ sơ và quyền truy cập
                        </Link>
                      </>
                    ) : (
                      <Button asChild>
                        <Link to={ROUTES.signIn}>Đăng nhập</Link>
                      </Button>
                    )}
                    <div className="mt-3 flex min-h-11 items-center justify-between border-t border-primary/10 pt-3 text-sm font-medium text-primary">
                      <span>Giao diện</span>
                      <ThemeToggle />
                    </div>
                    {session ? (
                      <LogoutButton
                        className="mt-2 w-full justify-start"
                        variant="ghost"
                      />
                    ) : null}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
