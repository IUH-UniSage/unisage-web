import { Home, LayoutDashboard, LogOut, UserRound } from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

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
import { ROUTES } from "@/constants/paths"
import { useAuth } from "@/features/auth/hooks/use-auth"

export function UserAccountMenu() {
  const { logout, session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const isInAdmin = location.pathname.startsWith(ROUTES.admin)

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Tài khoản"
          className="rounded-full"
          size="icon"
          variant="ghost"
        >
          <UserAvatar
            avatarUrl={session?.avatarUrl}
            fullName={session?.fullName}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {session?.fullName ?? "Người dùng"}
          </p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {session?.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() =>
            navigate(isInAdmin ? ROUTES.adminProfile : ROUTES.profile)
          }
        >
          <UserRound aria-hidden="true" />
          Thông tin cá nhân
        </DropdownMenuItem>
        {isInAdmin ? (
          <DropdownMenuItem onSelect={() => navigate(ROUTES.home)}>
            <Home aria-hidden="true" />
            Trang chủ
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => navigate(ROUTES.admin)}>
            <LayoutDashboard aria-hidden="true" />
            Trang quản trị
          </DropdownMenuItem>
        )}
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
  )
}
