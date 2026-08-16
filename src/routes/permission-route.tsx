import type { ReactNode } from "react"
import { Navigate, Outlet } from "react-router-dom"

import { ROUTES } from "@/constants/paths"
import type { Permission } from "@/lib/permissions"
import { hasAnyPermission, hasEveryPermission } from "@/lib/permissions"

type PermissionRouteProps = {
  children?: ReactNode
  fallbackTo?: string
  grantedPermissions: readonly Permission[]
  requiredPermissions: readonly Permission[]
  strategy?: "all" | "any"
}

export function PermissionRoute({
  children,
  fallbackTo = ROUTES.home,
  grantedPermissions,
  requiredPermissions,
  strategy = "all",
}: PermissionRouteProps) {
  const isAllowed =
    strategy === "all"
      ? hasEveryPermission(grantedPermissions, requiredPermissions)
      : hasAnyPermission(grantedPermissions, requiredPermissions)

  if (!isAllowed) {
    return <Navigate replace to={fallbackTo} />
  }

  return children ?? <Outlet />
}
