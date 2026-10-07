import { useCallback, useEffect, type RefObject } from "react"

import { TOUR_ANCHORS } from "@/constants/tour-anchors"
import {
  isTourActive,
  useTourRunner,
} from "@/features/product-tour/hooks/use-tour-runner"
import {
  DIALOG_TOURS,
  type DialogTourKey,
} from "@/features/product-tour/tours/dialog-tours"
import { findVisibleAnchor } from "@/features/product-tour/utils/tour-steps"
import {
  dialogTourKey,
  hasSeenTour,
} from "@/features/product-tour/utils/tour-storage"

// Long enough for the dialog's zoom-in / the sheet's slide-in to settle so
// the first highlight is measured at the final position.
const AUTO_START_DELAY_MS = 350
const AUTO_START_POLL_MS = 200
const AUTO_START_TIMEOUT_MS = 8_000

// `anchorRef` is any element rendered inside the dialog; the tour is scoped
// to the dialog that contains it.
export function useDialogTour(
  tourKey: DialogTourKey,
  anchorRef: RefObject<Element | null>
) {
  const { run } = useTourRunner()
  const tour = DIALOG_TOURS[tourKey]

  const runInDialog = useCallback(() => {
    const dialog = anchorRef.current?.closest('[role="dialog"]')
    if (!dialog) return false

    run(tour.steps, [dialogTourKey(tourKey)], { dialog })
    return true
  }, [anchorRef, run, tour, tourKey])

  useEffect(() => {
    if (hasSeenTour(dialogTourKey(tourKey))) return

    const readyAnchor =
      "readyAnchor" in tour ? tour.readyAnchor : TOUR_ANCHORS.dialogHeader
    const startedAt = Date.now()
    let timer: number | undefined

    const poll = () => {
      const dialog = anchorRef.current?.closest('[role="dialog"]')
      const ready = dialog && findVisibleAnchor(readyAnchor, dialog)

      if (ready && !isTourActive()) {
        runInDialog()
      } else if (Date.now() - startedAt < AUTO_START_TIMEOUT_MS) {
        timer = window.setTimeout(poll, AUTO_START_POLL_MS)
      }
    }
    timer = window.setTimeout(poll, AUTO_START_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [anchorRef, runInDialog, tour, tourKey])

  return { start: runInDialog }
}
