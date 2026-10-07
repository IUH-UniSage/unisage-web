import { useState } from "react"
import type { ComponentProps } from "react"
import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/paths"
import { useAuth } from "@/features/auth/hooks/use-auth"

type LogoutButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "onClick"
> & {
  label?: string
}

export function LogoutButton({
  disabled,
  label = "Đăng xuất",
  ...props
}: LogoutButtonProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
    <Button
      disabled={disabled || isLoggingOut}
      onClick={() => void handleLogout()}
      type="button"
      {...props}
    >
      <LogOut aria-hidden="true" />
      {isLoggingOut ? "Đang đăng xuất..." : label}
    </Button>
  )
}
