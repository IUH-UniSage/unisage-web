import type { ReactNode } from "react"
import { Navigate, Outlet } from "react-router-dom"

import { FullScreenLoading } from "@/components/shared/full-screen-loading"
import { ROUTES } from "@/constants/paths"

export type AuthenticationStatus =
  "authenticated" | "loading" | "unauthenticated"

type PrivateRouteProps = {
  children?: ReactNode
  redirectTo?: string
  status: AuthenticationStatus
}

export function PrivateRoute({
  children,
  redirectTo = ROUTES.signIn,
  status,
}: PrivateRouteProps) {
  if (status === "loading") {
    return <FullScreenLoading message="Đang kiểm tra quyền truy cập..." />
  }

  if (status === "unauthenticated") {
    return <Navigate replace to={redirectTo} />
  }

  return children ?? <Outlet />
}
