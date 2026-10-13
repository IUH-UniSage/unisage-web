import { useEffect } from "react"

// A drop this large in the visible height is the on-screen keyboard, not the
// browser toolbar collapsing (~50-80px on iOS Safari / Android Chrome).
const KEYBOARD_MIN_HEIGHT = 150

/**
 * Pins a full-screen shell to the part of the screen the user can actually see.
 *
 * On iOS Safari (and Android Chrome by default) the on-screen keyboard does not
 * shrink the page: it overlays it and scrolls the whole document up, so a
 * `h-svh` shell loses its header off the top and keeps empty space above the
 * keyboard. While mounted this writes the visual viewport to
 * `--app-height` / `--app-top` on <html> (for `h-[var(--app-height,100svh)]` and
 * `top-[var(--app-top,0px)]` on a `fixed` shell) and sets `data-keyboard="open"`
 * on <html> while the keyboard is up, like ChatGPT's composer that sits right on
 * the keyboard with the header still in place.
 */
export function useVisualViewport() {
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const root = document.documentElement
    // Tallest visible height seen at the current width: the keyboard-closed size.
    let fullHeight = viewport.height
    let width = viewport.width
    let frame = 0

    const update = () => {
      frame = 0
      if (viewport.width !== width) {
        // Rotation or resize: start over from this size.
        width = viewport.width
        fullHeight = viewport.height
      }
      fullHeight = Math.max(fullHeight, viewport.height)
      root.style.setProperty("--app-height", `${viewport.height}px`)
      root.style.setProperty("--app-top", `${viewport.offsetTop}px`)
      if (fullHeight - viewport.height > KEYBOARD_MIN_HEIGHT) {
        root.dataset.keyboard = "open"
      } else {
        delete root.dataset.keyboard
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    viewport.addEventListener("resize", schedule)
    viewport.addEventListener("scroll", schedule)
    return () => {
      viewport.removeEventListener("resize", schedule)
      viewport.removeEventListener("scroll", schedule)
      if (frame) cancelAnimationFrame(frame)
      root.style.removeProperty("--app-height")
      root.style.removeProperty("--app-top")
      delete root.dataset.keyboard
    }
  }, [])
}
