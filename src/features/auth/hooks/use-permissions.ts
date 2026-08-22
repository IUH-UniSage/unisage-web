import { useAuth } from "@/features/auth/hooks/use-auth"
import type { PermissionRequirement } from "@/utils/permissions"
import {
  hasAnyPermissionInfo,
  hasEveryPermissionInfo,
  hasPermissionInfo,
} from "@/utils/permissions"

export function usePermissions() {
  const { session } = useAuth()
  const permissions = session?.permissions ?? []

  return {
    can: (requirement: PermissionRequirement) =>
      hasPermissionInfo(permissions, requirement),
    canAny: (requirements: readonly PermissionRequirement[]) =>
      hasAnyPermissionInfo(permissions, requirements),
    canEvery: (requirements: readonly PermissionRequirement[]) =>
      hasEveryPermissionInfo(permissions, requirements),
    permissions,
  }
}
