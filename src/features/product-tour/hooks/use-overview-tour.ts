import { useEffect } from "react"
import { matchPath, useLocation, useNavigate } from "react-router-dom"

import {
  isTourActive,
  useTourRunner,
} from "@/features/product-tour/hooks/use-tour-runner"
import type { OverviewStop } from "@/features/product-tour/tours/overview-tours"
import { findVisibleAnchor } from "@/features/product-tour/utils/tour-steps"
import {
  hasSeenTour,
  markTourSeen,
} from "@/features/product-tour/utils/tour-storage"

const POLL_MS = 300
const READY_TIMEOUT_MS = 10_000

export type OverviewTourPlan = {
  key: string
  stops: readonly OverviewStop[]
}

// Moving on to the next page can swap the layout hosting this hook (home is
// under UserLayout, chat under ChatLayout), so the current stop is kept
// outside React.
let activeStop: { index: number; key: string } | null = null

// Runs the first-login walkthrough once: it starts on its first page (where
// the user lands after signing in), each page's last step navigates to the
// next one, and closing or finishing it at any point marks it seen.
// `plan` must be referentially stable while the tour runs, or the effect
// cleanup would end it.
export function useOverviewTour(plan: OverviewTourPlan | null) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { run, stop } = useTourRunner()

  useEffect(() => {
    if (!plan || hasSeenTour(plan.key)) return

    const index = activeStop?.key === plan.key ? activeStop.index : 0
    const current = plan.stops[index]
    if (!current || !matchPath(current.path, pathname)) return

    const following = plan.stops[index + 1]
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      if (findVisibleAnchor(current.readyAnchor) && !isTourActive()) {
        window.clearInterval(timer)
        activeStop = { index, key: plan.key }
        run(current.steps, {
          next: following
            ? {
                go: () => {
                  activeStop = { index: index + 1, key: plan.key }
                  void navigate(following.path)
                },
                label: following.label,
              }
            : undefined,
          onEnd: () => {
            activeStop = null
            markTourSeen(plan.key)
          },
          progressSuffix: `Trang ${index + 1}/${plan.stops.length}`,
        })
      } else if (Date.now() - startedAt > READY_TIMEOUT_MS) {
        window.clearInterval(timer)
      }
    }, POLL_MS)

    return () => {
      window.clearInterval(timer)
      // Leaving the page mid-tour (back button, a link) ends it.
      stop()
    }
  }, [navigate, pathname, plan, run, stop])
}
