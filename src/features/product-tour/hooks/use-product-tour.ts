import { driver, type Driver, type PopoverDOM } from "driver.js"
import "driver.js/dist/driver.css"
import { useCallback, useEffect, useRef } from "react"

import { TOUR_ANCHORS } from "@/constants/tour-anchors"
import {
  PAGE_TOURS,
  WORKSPACE_INTRO_STEPS,
  type TourStep,
} from "@/features/product-tour/tours/staff-tours"
import {
  buildDriveSteps,
  findVisibleAnchor,
} from "@/features/product-tour/utils/tour-steps"
import {
  hasSeenTour,
  markToursSeen,
  pageTourKey,
  workspaceIntroTourKey,
} from "@/features/product-tour/utils/tour-storage"
import type { StaffWorkspace } from "@/routes/feature-registry"

// Pages render a skeleton while their first query is pending, so the
// auto-start waits for the real page header before measuring anchors.
const AUTO_START_POLL_MS = 300
const AUTO_START_TIMEOUT_MS = 10_000

type UseProductTourOptions = {
  // FEATURE_REGISTRY key of the page being shown, or null on a route that
  // isn't a workspace list page (detail/form screens, profile, ...).
  featureKey: string | null
  workspace: StaffWorkspace
}

// driver.js has no built-in skip action, so add one next to "Quay lại" on
// every step but the last (where "Hoàn tất" already ends the tour).
function addSkipButton(popover: PopoverDOM, tour: Driver) {
  if (tour.isLastStep()) return

  const skipButton = document.createElement("button")
  skipButton.className = "driver-popover-footer-btn unisage-tour-skip-btn"
  skipButton.textContent = "Bỏ qua"
  skipButton.type = "button"
  skipButton.addEventListener("click", () => tour.destroy())
  popover.footerButtons.prepend(skipButton)
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

export function useProductTour({
  featureKey,
  workspace,
}: UseProductTourOptions) {
  const driverRef = useRef<Driver | null>(null)
  const pageSteps = featureKey ? PAGE_TOURS[featureKey] : undefined

  const run = useCallback(
    (steps: readonly TourStep[], seenKeys: readonly string[]) => {
      driverRef.current?.destroy()

      const driveSteps = buildDriveSteps(steps)
      if (!driveSteps.length) return

      const reducedMotion = prefersReducedMotion()
      const tour = driver({
        animate: !reducedMotion,
        closeBtnLabel: "Đóng hướng dẫn",
        doneBtnText: "Hoàn tất",
        nextBtnText: "Tiếp",
        onDestroyed: () => {
          markToursSeen(seenKeys)
          driverRef.current = null
        },
        onPopoverRender: (popover, { driver: activeTour }) =>
          addSkipButton(popover, activeTour),
        overlayOpacity: 0.55,
        popoverClass: "unisage-tour",
        prevBtnText: "Quay lại",
        progressText: "{{current}}/{{total}}",
        showProgress: driveSteps.length > 1,
        smoothScroll: !reducedMotion,
        stagePadding: 6,
        stageRadius: 10,
        steps: driveSteps,
      })

      driverRef.current = tour
      tour.drive()
    },
    []
  )

  useEffect(() => {
    if (!featureKey || !pageSteps) return

    const introKey = workspaceIntroTourKey(workspace)
    const pageKey = pageTourKey(featureKey)
    const introSeen = hasSeenTour(introKey)
    const pageSeen = hasSeenTour(pageKey)
    if (introSeen && pageSeen) return

    const steps = [
      ...(introSeen ? [] : WORKSPACE_INTRO_STEPS[workspace]),
      ...(pageSeen ? [] : pageSteps),
    ]
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      if (findVisibleAnchor(TOUR_ANCHORS.pageHeader)) {
        window.clearInterval(timer)
        run(steps, [introKey, pageKey])
      } else if (Date.now() - startedAt > AUTO_START_TIMEOUT_MS) {
        window.clearInterval(timer)
      }
    }, AUTO_START_POLL_MS)

    return () => window.clearInterval(timer)
  }, [featureKey, pageSteps, run, workspace])

  // Leaving the page mid-tour would leave the overlay pointing at elements
  // that no longer exist.
  useEffect(
    () => () => {
      driverRef.current?.destroy()
    },
    [featureKey]
  )

  const start = useCallback(() => {
    if (!featureKey || !pageSteps) return
    run(pageSteps, [pageTourKey(featureKey)])
  }, [featureKey, pageSteps, run])

  return { hasTour: Boolean(pageSteps), start }
}
