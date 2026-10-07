import { useCallback, useEffect } from "react"

import { TOUR_ANCHORS } from "@/constants/tour-anchors"
import {
  isTourActive,
  useTourRunner,
} from "@/features/product-tour/hooks/use-tour-runner"
import type { TourStep } from "@/features/product-tour/tours/tour-step"
import type { PageTour } from "@/features/product-tour/utils/resolve-page-tour"
import { findVisibleAnchor } from "@/features/product-tour/utils/tour-steps"
import {
  hasSeenTour,
  pageTourKey,
} from "@/features/product-tour/utils/tour-storage"

// Pages render a skeleton while their first query is pending, so the
// auto-start waits for the page's ready anchor before measuring anchors.
const AUTO_START_POLL_MS = 300
const AUTO_START_TIMEOUT_MS = 10_000

type UseProductTourOptions = {
  // Workspace introduction shown ahead of the page's steps on first visit.
  intro?: { key: string; steps: readonly TourStep[] }
  // Must be referentially stable (memoised or a module constant).
  pageTour: PageTour | null
}

export function useProductTour({ intro, pageTour }: UseProductTourOptions) {
  const { run, stop } = useTourRunner()
  const introKey = intro?.key
  const introSteps = intro?.steps

  useEffect(() => {
    if (!pageTour) return

    const pageKey = pageTourKey(pageTour.key)
    const seenKeys = introKey ? [introKey, pageKey] : [pageKey]
    const allSeen = () => seenKeys.every(hasSeenTour)
    if (allSeen()) return

    const readyAnchor = pageTour.readyAnchor ?? TOUR_ANCHORS.pageHeader
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      // The same page can mount more than one button (separate mobile and
      // desktop headers); whichever polls first runs the tour, and the
      // other stops once it has been marked seen.
      if (allSeen()) {
        window.clearInterval(timer)
      } else if (findVisibleAnchor(readyAnchor) && !isTourActive()) {
        window.clearInterval(timer)
        run(
          [
            ...(introKey && !hasSeenTour(introKey) ? (introSteps ?? []) : []),
            ...(hasSeenTour(pageKey) ? [] : pageTour.steps),
          ],
          seenKeys
        )
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
  }, [introKey, introSteps, pageTour, run, stop])

  const start = useCallback(() => {
    if (!pageTour) return
    run(pageTour.steps, [pageTourKey(pageTour.key)])
  }, [pageTour, run])

  return { hasTour: Boolean(pageTour), start }
}
