import { useCallback } from "react"

import { useTourRunner } from "@/features/product-tour/hooks/use-tour-runner"
import type { PageTour } from "@/features/product-tour/utils/resolve-page-tour"

// A page's own tour only runs from its "?" button; the first-login
// walkthrough is the overview tour (see useOverviewTour).
export function useProductTour(pageTour: PageTour | null) {
  const { run } = useTourRunner()

  const start = useCallback(() => {
    if (pageTour) run(pageTour.steps)
  }, [pageTour, run])

  return { hasTour: Boolean(pageTour), start }
}
