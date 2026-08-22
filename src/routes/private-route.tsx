import type { ReactNode } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { FullScreenLoading } from "@/components/shared/full-screen-loading"
import { ROUTES } from "@/constants/paths"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { getRoleHome } from "@/features/auth/utils/role-routing"
import type { AuthenticationStatus } from "@/features/auth/model/auth-context"

export type { AuthenticationStatus }

type PrivateRouteProps = {
  allowedRoles?: readonly string[]
  children?: ReactNode
  redirectTo?: string
  status?: AuthenticationStatus
}

export function PrivateRoute({
  allowedRoles,
  children,
  redirectTo = ROUTES.signIn,
  status: statusOverride,
}: PrivateRouteProps) {
  const auth = useAuth()
  const location = useLocation()
  const status = statusOverride ?? auth.status

  if (status === "loading") {
    return <FullScreenLoading message="Đang kiểm tra quyền truy cập..." />
  }

  if (status === "unauthenticated") {
    return (
      <Navigate replace state={{ from: location.pathname }} to={redirectTo} />
    )
  }

  if (
    allowedRoles?.length &&
    auth.session &&
    !allowedRoles.includes(auth.session.role)
  ) {
    return <Navigate replace to={getRoleHome(auth.session.role)} />
  }

  return children ?? <Outlet />
}
