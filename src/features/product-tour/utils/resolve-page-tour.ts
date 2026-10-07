import { PAGE_TOURS } from "@/features/product-tour/tours/staff-tours"
import { getRouteTourForPath } from "@/features/product-tour/tours/route-tours"
import type { TourStep } from "@/features/product-tour/tours/tour-step"
import {
  getWorkspaceFeatureKeyForPath,
  type StaffWorkspace,
} from "@/routes/feature-registry"

export type PageTour = {
  key: string
  steps: readonly TourStep[]
}

// List pages are keyed by their FEATURE_REGISTRY entry; detail and form
// screens below them by their route tour.
export function resolveStaffPageTour(
  workspace: StaffWorkspace,
  pathname: string
): PageTour | null {
  const featureKey = getWorkspaceFeatureKeyForPath(workspace, pathname)
  if (featureKey) {
    const steps = PAGE_TOURS[featureKey]
    return steps ? { key: featureKey, steps } : null
  }

  const routeTour = getRouteTourForPath(pathname)
  return routeTour ? { key: routeTour.key, steps: routeTour.steps } : null
}
