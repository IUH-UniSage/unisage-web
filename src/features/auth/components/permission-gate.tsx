import type { ReactNode } from "react"

import { usePermissions } from "@/features/auth/hooks/use-permissions"
import type { PermissionRequirement } from "@/utils/permissions"

type PermissionGateProps = {
  children: ReactNode
  fallback?: ReactNode
  requiredPermissions: readonly PermissionRequirement[]
  strategy?: "all" | "any"
}

export function PermissionGate({
  children,
  fallback = null,
  requiredPermissions,
  strategy = "any",
}: PermissionGateProps) {
  const { canAny, canEvery } = usePermissions()
  const isAllowed =
    strategy === "all"
      ? canEvery(requiredPermissions)
      : canAny(requiredPermissions)

  return isAllowed ? children : fallback
}
