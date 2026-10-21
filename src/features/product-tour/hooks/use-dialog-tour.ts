import { useCallback, type RefObject } from "react"

import { useTourRunner } from "@/features/product-tour/hooks/use-tour-runner"
import {
  DIALOG_TOURS,
  type DialogTourKey,
} from "@/features/product-tour/tours/dialog-tours"

// `anchorRef` is any element rendered inside the dialog; the tour is scoped
// to the dialog that contains it.
export function useDialogTour(
  tourKey: DialogTourKey,
  anchorRef: RefObject<Element | null>
) {
  const { run } = useTourRunner()
  const tour = DIALOG_TOURS[tourKey]

  const start = useCallback(() => {
    const dialog = anchorRef.current?.closest('[role="dialog"]')
    if (dialog) run(tour.steps, { dialog })
  }, [anchorRef, run, tour])

  return { start }
}
