import type { ReactNode } from "react"
import { Navigate, Outlet } from "react-router-dom"

import { FullScreenLoading } from "@/components/shared/full-screen-loading"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { getRoleHome } from "@/features/auth/utils/role-routing"

type GuestRouteProps = {
  children?: ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { session, status } = useAuth()

  if (status === "loading") {
    return <FullScreenLoading message="Đang khôi phục phiên đăng nhập..." />
  }

  if (status === "authenticated" && session) {
    return <Navigate replace to={getRoleHome(session.role)} />
  }

  return children ?? <Outlet />
}
