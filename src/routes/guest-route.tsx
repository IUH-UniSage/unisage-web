import type { ReactNode } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { FullScreenLoading } from "@/components/shared/full-screen-loading"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { getPostSignInPath } from "@/features/auth/utils/role-routing"

type GuestRouteProps = {
  children?: ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { session, status } = useAuth()
  const location = useLocation()

  if (status === "loading") {
    return <FullScreenLoading message="Đang khôi phục phiên đăng nhập..." />
  }

  if (status === "authenticated" && session) {
    // Signing in flips the status before SignInPage navigates: send the user to
    // the same place it would (the `from` page, else the role's home).
    return (
      <Navigate replace to={getPostSignInPath(location.state, session.role)} />
    )
  }

  return children ?? <Outlet />
}
