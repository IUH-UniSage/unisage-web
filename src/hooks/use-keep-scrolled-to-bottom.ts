import { type RefObject, useEffect } from "react"

// Within this many pixels of the end still counts as "reading the latest".
const BOTTOM_SLACK = 32

/**
 * Keeps a chat scroll area on its latest content, like ChatGPT: while the
 * reader is at the end, the area follows it when the content grows (an answer
 * streaming in, a conversation loading) and when the area gets shorter (the
 * on-screen keyboard opening, the composer growing). Scrolling up to read
 * stops the following until the reader comes back to the end.
 * `rootRef` is a shadcn `ScrollArea` root (its viewport is found inside).
 */
export function useKeepScrolledToBottom(
  rootRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const viewport = rootRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    )
    if (!viewport) return

    // Starts at the end: an opened conversation shows its latest message.
    let atBottom = true

    const onScroll = () => {
      atBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <=
        BOTTOM_SLACK
    }
    const observer = new ResizeObserver(() => {
      if (atBottom) {
        viewport.scrollTop = viewport.scrollHeight
      }
    })

    viewport.addEventListener("scroll", onScroll, { passive: true })
    observer.observe(viewport)
    if (viewport.firstElementChild) {
      observer.observe(viewport.firstElementChild)
    }
    return () => {
      viewport.removeEventListener("scroll", onScroll)
      observer.disconnect()
    }
  }, [rootRef])
}
