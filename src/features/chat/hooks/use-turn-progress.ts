import { useCallback, useEffect, useRef, useState } from "react"

import type { ChatStatus } from "@/features/chat/schemas/chat-progress-schemas"

// The agent sends every web page it reads at once (one search returns them
// all), so each stays on screen at least this long, one after the other.
export const WEB_PAGE_MIN_VISIBLE_MS = 800

export type TurnProgress = {
  /** The assistant bubble of the turn in flight. */
  messageId: string
  /** `Date.now()` when the user's message went into the conversation. */
  startedAt: number
  /** What the turn is doing now; null until the first `event: status`. */
  status: ChatStatus | null
}

/**
 * The in-flight turn's clock and status line. `push` shows a stage at once
 * (dropping web pages still waiting their turn); web pages (`url`) queue up
 * and change every `WEB_PAGE_MIN_VISIBLE_MS`.
 */
export function useTurnProgress() {
  const [progress, setProgress] = useState<TurnProgress | null>(null)
  const pagesRef = useRef<ChatStatus[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pageShownAtRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const show = useCallback((status: ChatStatus) => {
    pageShownAtRef.current = status.url ? Date.now() : null
    setProgress((current) => (current ? { ...current, status } : current))
  }, [])

  // Shows the next waiting page, then the one after it every
  // WEB_PAGE_MIN_VISIBLE_MS until none is left.
  const showWaitingPages = useCallback(() => {
    const step = () => {
      timerRef.current = null
      const next = pagesRef.current.shift()
      if (!next) return
      show(next)
      if (pagesRef.current.length) {
        timerRef.current = setTimeout(step, WEB_PAGE_MIN_VISIBLE_MS)
      }
    }
    step()
  }, [show])

  const start = useCallback(
    (messageId: string) => {
      clearTimer()
      pagesRef.current = []
      pageShownAtRef.current = null
      setProgress({ messageId, startedAt: Date.now(), status: null })
    },
    [clearTimer]
  )

  const push = useCallback(
    (status: ChatStatus) => {
      if (!status.url) {
        clearTimer()
        pagesRef.current = []
        show(status)
        return
      }
      pagesRef.current.push(status)
      if (timerRef.current !== null) return
      const shownAt = pageShownAtRef.current
      const wait =
        shownAt === null ? 0 : shownAt + WEB_PAGE_MIN_VISIBLE_MS - Date.now()
      if (wait > 0) {
        timerRef.current = setTimeout(showWaitingPages, wait)
      } else {
        showWaitingPages()
      }
    },
    [clearTimer, show, showWaitingPages]
  )

  const stop = useCallback(() => {
    clearTimer()
    pagesRef.current = []
    pageShownAtRef.current = null
    setProgress(null)
  }, [clearTimer])

  useEffect(() => clearTimer, [clearTimer])

  return { progress, push, start, stop }
}
