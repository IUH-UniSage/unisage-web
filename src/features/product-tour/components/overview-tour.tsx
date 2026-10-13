import { useMemo } from "react"

import { useVisibleNavItems } from "@/components/shared/navigation/use-visible-nav-items"
import { ROUTES } from "@/constants/paths"
import { useAuth } from "@/features/auth"
import { getRoleHome } from "@/features/auth/utils/role-routing"
import {
  useOverviewTour,
  type OverviewTourPlan,
} from "@/features/product-tour/hooks/use-overview-tour"
import {
  CLIENT_OVERVIEW_STOPS,
  resolveStaffOverviewStops,
} from "@/features/product-tour/tours/overview-tours"
import { overviewTourKey } from "@/features/product-tour/utils/tour-storage"
import type { StaffWorkspace } from "@/routes/feature-registry"

// Mount once per layout; renders nothing.
export function StaffOverviewTour({
  workspace,
}: {
  workspace: StaffWorkspace
}) {
  const { session } = useAuth()
  const userId = session?.userId
  const visibleItems = useVisibleNavItems(workspace)
  // A new array every render; the plan only changes with what is visible.
  const visibleKeys = visibleItems.map((item) => item.key).join()

  const plan = useMemo<OverviewTourPlan | null>(
    () =>
      userId
        ? {
            key: overviewTourKey(workspace, userId),
            stops: resolveStaffOverviewStops(workspace, visibleItems),
          }
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see visibleKeys
    [userId, visibleKeys, workspace]
  )
  useOverviewTour(plan)

  return null
}

// Mount in every student-facing layout the tour passes through. Guests and
// staff browsing the student pages don't get it.
export function ClientOverviewTour() {
  const { session } = useAuth()
  const userId =
    session && getRoleHome(session.role) === ROUTES.home
      ? session.userId
      : undefined

  const plan = useMemo<OverviewTourPlan | null>(
    () =>
      userId
        ? {
            key: overviewTourKey("client", userId),
            stops: CLIENT_OVERVIEW_STOPS,
          }
        : null,
    [userId]
  )
  useOverviewTour(plan)

  return null
}
