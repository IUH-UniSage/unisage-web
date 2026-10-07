import type { DriveStep } from "driver.js"

import { tourAnchorSelector, type TourTarget } from "@/constants/tour-anchors"
import type { TourStep } from "@/features/product-tour/tours/tour-step"

// An anchor can exist more than once (the sidebar is mounted both as the
// desktop rail and inside the mobile sheet, DataTable is reused inside
// dialogs, every chunk card carries the same anchors) and some copies are
// hidden by responsive classes, so pick the first one that is laid out.
export function findVisibleAnchor(
  target: TourTarget | readonly TourTarget[],
  root: ParentNode = document
): Element | null {
  const targets: readonly TourTarget[] =
    typeof target === "string" ? [target] : target

  for (const candidate of targets) {
    const match = Array.from(
      root.querySelectorAll(tourAnchorSelector(candidate))
    ).find((element) => element.getClientRects().length > 0)
    if (match) return match
  }

  return null
}

// Steps whose anchor is not on screen (permission-gated button, empty list
// with no table, inactive tab, element hidden at this breakpoint) are dropped
// up front so the progress counter only counts steps the user will see.
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
