import {
  HelpCircle,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  UserRound,
} from "lucide-react"
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
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { ChangePasswordDialog } from "@/features/profile/components/change-password-dialog"

export function UserAccountMenu() {
  const { logout, session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const isInAdmin = location.pathname.startsWith(ROUTES.admin)
  // Only system-role accounts can open the admin workspace.
  const canOpenAdmin = Boolean(session?.isSystemRole) && !isInAdmin

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await logout()
      await navigate(ROUTES.home, { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            {...tourAnchor(TOUR_ANCHORS.accountMenu)}
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

          <DropdownMenuItem onSelect={() => navigate(ROUTES.home)}>
            <Home aria-hidden="true" className="mr-2 size-4" />
            Trang chủ
          </DropdownMenuItem>
          {canOpenAdmin ? (
            <DropdownMenuItem onSelect={() => navigate(ROUTES.admin)}>
              <LayoutDashboard aria-hidden="true" className="mr-2 size-4" />
              Trang quản trị
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onSelect={() => navigate(ROUTES.tickets)}>
            <HelpCircle aria-hidden="true" className="mr-2 size-4" />
            Yêu cầu hỗ trợ
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() =>
              navigate(isInAdmin ? ROUTES.adminProfile : ROUTES.profile)
            }
          >
            <UserRound aria-hidden="true" className="mr-2 size-4" />
            Thông tin cá nhân
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsPasswordDialogOpen(true)}>
            <KeyRound aria-hidden="true" className="mr-2 size-4" />
            Đổi mật khẩu
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={isLoggingOut}
            onSelect={() => void handleLogout()}
            variant="destructive"
          >
            <LogOut aria-hidden="true" className="mr-2 size-4" />
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog
        onOpenChange={setIsPasswordDialogOpen}
        open={isPasswordDialogOpen}
      />
    </>
  )
}
