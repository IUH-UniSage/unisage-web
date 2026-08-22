import type { ReactNode } from "react"
import { Navigate, Outlet } from "react-router-dom"

import { ROUTES } from "@/constants/paths"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import type { PermissionInfo } from "@/features/auth/schemas/auth-schemas"
import type { PermissionRequirement } from "@/utils/permissions"
import {
  hasAnyPermissionInfo,
  hasEveryPermissionInfo,
} from "@/utils/permissions"

type PermissionRouteProps = {
  children?: ReactNode
  fallback?: ReactNode
  fallbackTo?: string
  grantedPermissions?: readonly PermissionInfo[]
  requiredPermissions: readonly PermissionRequirement[]
  strategy?: "all" | "any"
}

export function PermissionRoute({
  children,
  fallback,
  fallbackTo = ROUTES.home,
  grantedPermissions,
  requiredPermissions,
  strategy = "all",
}: PermissionRouteProps) {
  const { permissions: sessionPermissions } = usePermissions()
  const permissions = grantedPermissions ?? sessionPermissions
  const isAllowed =
    strategy === "all"
      ? hasEveryPermissionInfo(permissions, requiredPermissions)
      : hasAnyPermissionInfo(permissions, requiredPermissions)

  if (!isAllowed) {
    return fallback ?? <Navigate replace to={fallbackTo} />
  }

  return children ?? <Outlet />
}
