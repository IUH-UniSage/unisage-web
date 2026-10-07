import type { DriveStep } from "driver.js"

import { tourAnchorSelector, type TourAnchor } from "@/constants/tour-anchors"
import type { TourStep } from "@/features/product-tour/tours/staff-tours"

// An anchor can exist more than once (the sidebar is mounted both as the
// desktop rail and inside the mobile sheet, DataTable is reused inside
// dialogs) and some copies are hidden by responsive classes, so pick the
// first one that is actually laid out.
export function findVisibleAnchor(
  anchor: TourAnchor,
  root: ParentNode = document
): Element | null {
  const candidates = root.querySelectorAll(tourAnchorSelector(anchor))

  return (
    Array.from(candidates).find(
      (element) => element.getClientRects().length > 0
    ) ?? null
  )
}

// Steps whose anchor is not on screen (permission-gated button, empty list
// with no table, element hidden at this breakpoint) are dropped up front so
// the progress counter only counts steps the user will actually see.
export function buildDriveSteps(
  steps: readonly TourStep[],
  root: ParentNode = document
): DriveStep[] {
  return steps.flatMap((step) => {
    const popover = {
      align: "start" as const,
      description: step.description,
      side: step.side,
      title: step.title,
    }

    if (!step.anchor) return [{ popover }]

    const element = findVisibleAnchor(step.anchor, root)
    return element ? [{ element, popover }] : []
  })
}
