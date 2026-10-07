import { useMemo } from "react"

import { TourHelpButton } from "@/features/product-tour/components/tour-help-button"
import { useProductTour } from "@/features/product-tour/hooks/use-product-tour"
import { WORKSPACE_INTRO_STEPS } from "@/features/product-tour/tours/staff-tours"
import { resolveStaffPageTour } from "@/features/product-tour/utils/resolve-page-tour"
import { workspaceIntroTourKey } from "@/features/product-tour/utils/tour-storage"
import type { StaffWorkspace } from "@/routes/feature-registry"

type ProductTourButtonProps = {
  pathname: string
  workspace: StaffWorkspace
}

// Staff workspaces: the workspace intro runs ahead of the page's own steps
// on a first visit.
export function ProductTourButton({
  pathname,
  workspace,
}: ProductTourButtonProps) {
  const pageTour = useMemo(
    () => resolveStaffPageTour(workspace, pathname),
    [pathname, workspace]
  )
  const intro = useMemo(
    () => ({
      key: workspaceIntroTourKey(workspace),
      steps: WORKSPACE_INTRO_STEPS[workspace],
    }),
    [workspace]
  )
  const { hasTour, start } = useProductTour({ intro, pageTour })

  return hasTour ? <TourHelpButton onClick={start} /> : null
}
