import { driver, type Driver, type PopoverDOM } from "driver.js"
import "driver.js/dist/driver.css"
import { useCallback, useEffect, useRef } from "react"

import type { TourStep } from "@/features/product-tour/tours/tour-step"
import { buildDriveSteps } from "@/features/product-tour/utils/tour-steps"

type RunTourOptions = {
  // Element the tour lives in: the open dialog for a dialog tour. Anchors are
  // looked up inside it, and the dialog is kept open while the tour runs.
  dialog?: Element
  // Set on every page of a multi-page tour but the last: the final step's
  // button moves on to the next page instead of finishing the tour.
  next?: { go: () => void; label: string }
  // Closed, skipped or finished - not called when handing over to `next`.
  onEnd?: () => void
  // Shown after the step counter, e.g. which page of a multi-page tour.
  progressSuffix?: string
}

// driver.js has no built-in skip action, so add one next to "Quay lại" on
// every step but the last (where "Hoàn tất" already ends the tour). A tour
// that continues on another page keeps it there too, to skip the rest.
function addSkipButton(
  popover: PopoverDOM,
  tour: Driver,
  onSkip: () => void,
  hasNextPage: boolean
) {
  if (tour.isLastStep() && !hasNextPage) return

  const skipButton = document.createElement("button")
  skipButton.className = "driver-popover-footer-btn unisage-tour-skip-btn"
  skipButton.textContent = "Bỏ qua"
  skipButton.type = "button"
  skipButton.addEventListener("click", onSkip)
  popover.footerButtons.prepend(skipButton)
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

// The tour popover and overlay are rendered outside the Radix dialog, so a
// click on them counts as "outside" and Escape (which driver.js handles on
// keyup to close the tour) would also close the dialog on keydown. Swallow
// both before Radix's document listeners see them while the tour is open.
function keepDialogOpen(dialog: Element): () => void {
  const onPointerDown = (event: PointerEvent) => {
    if (event.target instanceof Node && dialog.contains(event.target)) return
    event.stopPropagation()
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") event.stopPropagation()
  }

  window.addEventListener("pointerdown", onPointerDown, true)
  window.addEventListener("keydown", onKeyDown, true)

  return () => {
    window.removeEventListener("pointerdown", onPointerDown, true)
    window.removeEventListener("keydown", onKeyDown, true)
  }
}

export function isTourActive(): boolean {
  return document.body.classList.contains("driver-active")
}

export function useTourRunner() {
  const endRef = useRef<(() => void) | null>(null)

  const stop = useCallback(() => {
    endRef.current?.()
  }, [])

  const run = useCallback(
    (
      steps: readonly TourStep[],
      { dialog, next, onEnd, progressSuffix }: RunTourOptions = {}
    ) => {
      endRef.current?.()

      const driveSteps = buildDriveSteps(steps, dialog)
      if (!driveSteps.length) {
        // Nothing of this page is on screen; keep a multi-page tour moving.
        if (next) next.go()
        else onEnd?.()
        return
      }

      if (next) {
        const last = driveSteps[driveSteps.length - 1]
        last.popover = {
          ...last.popover,
          doneBtnText: `Tiếp: ${next.label}`,
          onDoneClick: () => end({ handover: true }),
        }
      }

      const releaseDialog = dialog ? keepDialogOpen(dialog) : undefined
      const reducedMotion = prefersReducedMotion()
      let ended = false
      // driver.js only fires onDestroyed once a step's highlight animation
      // has finished, so a tour closed mid-animation would never report its
      // end or release the dialog. Every exit goes through here instead.
      const end = ({ handover = false } = {}) => {
        if (ended) return
        ended = true
        tour.destroy()
        releaseDialog?.()
        if (endRef.current === stop) endRef.current = null
        if (handover) next?.go()
        else onEnd?.()
      }
      const stop = () => end()
      const tour = driver({
        animate: !reducedMotion,
        closeBtnLabel: "Đóng hướng dẫn",
        doneBtnText: "Hoàn tất",
        nextBtnText: "Tiếp",
        // Close button, Escape, overlay click and "Hoàn tất" all land here.
        onDestroyStarted: stop,
        onPopoverRender: (popover, { driver: activeTour }) =>
          addSkipButton(popover, activeTour, stop, Boolean(next)),
        overlayOpacity: 0.55,
        popoverClass: "unisage-tour",
        prevBtnText: "Quay lại",
        progressText: progressSuffix
          ? `{{current}}/{{total}} · ${progressSuffix}`
          : "{{current}}/{{total}}",
        showProgress: driveSteps.length > 1 || Boolean(progressSuffix),
        smoothScroll: !reducedMotion,
        stagePadding: 6,
        stageRadius: 10,
        steps: driveSteps,
      })

      endRef.current = stop
      tour.drive()
    },
    []
  )

  // A tour must never outlive the page or dialog that started it, or the
  // overlay would keep pointing at elements that no longer exist.
  useEffect(() => stop, [stop])

  return { run, stop }
}
