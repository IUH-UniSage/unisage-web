import { useCallback, useEffect, useMemo } from "react"

import { TOUR_ANCHORS } from "@/constants/tour-anchors"
import {
  isTourActive,
  useTourRunner,
} from "@/features/product-tour/hooks/use-tour-runner"
import { WORKSPACE_INTRO_STEPS } from "@/features/product-tour/tours/staff-tours"
import { resolveStaffPageTour } from "@/features/product-tour/utils/resolve-page-tour"
import { findVisibleAnchor } from "@/features/product-tour/utils/tour-steps"
import {
  hasSeenTour,
  pageTourKey,
  workspaceIntroTourKey,
} from "@/features/product-tour/utils/tour-storage"
import type { StaffWorkspace } from "@/routes/feature-registry"

// Pages render a skeleton while their first query is pending, so the
// auto-start waits for the real page header before measuring anchors.
const AUTO_START_POLL_MS = 300
const AUTO_START_TIMEOUT_MS = 10_000

type UseProductTourOptions = {
  pathname: string
  workspace: StaffWorkspace
}

export function useProductTour({ pathname, workspace }: UseProductTourOptions) {
  const { run, stop } = useTourRunner()
  const pageTour = useMemo(
    () => resolveStaffPageTour(workspace, pathname),
    [pathname, workspace]
  )

  useEffect(() => {
    if (!pageTour) return

    const introKey = workspaceIntroTourKey(workspace)
    const pageKey = pageTourKey(pageTour.key)
    const introSeen = hasSeenTour(introKey)
    const pageSeen = hasSeenTour(pageKey)
    if (introSeen && pageSeen) return

    const steps = [
      ...(introSeen ? [] : WORKSPACE_INTRO_STEPS[workspace]),
      ...(pageSeen ? [] : pageTour.steps),
    ]
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      if (findVisibleAnchor(TOUR_ANCHORS.pageHeader) && !isTourActive()) {
        window.clearInterval(timer)
        run(steps, [introKey, pageKey])
      } else if (Date.now() - startedAt > AUTO_START_TIMEOUT_MS) {
        window.clearInterval(timer)
      }
    }, AUTO_START_POLL_MS)

    return () => {
      window.clearInterval(timer)
      // Leaving the page mid-tour would leave the overlay pointing at
      // elements that no longer exist.
      stop()
    }
  }, [pageTour, run, stop, workspace])

  const start = useCallback(() => {
    if (!pageTour) return
    run(pageTour.steps, [pageTourKey(pageTour.key)])
  }, [pageTour, run])

  return { hasTour: Boolean(pageTour), start }
}
