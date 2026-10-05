import { usePermissions } from "@/features/auth/hooks/use-permissions"
import type { NavigationItem, StaffWorkspace } from "@/routes/feature-registry"
import { getWorkspaceNavItems } from "@/routes/feature-registry"

// The workspace's nav items the signed-in user is allowed to see - shared by
// the sidebar and the header search so both expose exactly the same pages.
export function useVisibleNavItems(
  workspace: StaffWorkspace
): NavigationItem[] {
  const { canAny, canEvery } = usePermissions()

  return getWorkspaceNavItems(workspace).filter(
    ({ requiredPermissions, requiredStrategy = "any" }) =>
      !requiredPermissions ||
      (requiredStrategy === "all"
        ? canEvery(requiredPermissions)
        : canAny(requiredPermissions))
  )
}
