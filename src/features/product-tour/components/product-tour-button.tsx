import { useMemo } from "react"

import { TourHelpButton } from "@/features/product-tour/components/tour-help-button"
import { useProductTour } from "@/features/product-tour/hooks/use-product-tour"
import { resolveStaffPageTour } from "@/features/product-tour/utils/resolve-page-tour"
import type { StaffWorkspace } from "@/routes/feature-registry"

type ProductTourButtonProps = {
  pathname: string
  workspace: StaffWorkspace
}

export function ProductTourButton({
  pathname,
  workspace,
}: ProductTourButtonProps) {
  const pageTour = useMemo(
    () => resolveStaffPageTour(workspace, pathname),
    [pathname, workspace]
  )
  const { hasTour, start } = useProductTour(pageTour)

  return hasTour ? <TourHelpButton onClick={start} /> : null
}
