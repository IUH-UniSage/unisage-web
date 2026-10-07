import { useEffect } from "react"

import { TOUR_ANCHORS } from "@/constants/tour-anchors"
import {
  isTourActive,
  useTourRunner,
} from "@/features/product-tour/hooks/use-tour-runner"
import {
  CHAT_REPLY_STEPS,
  CHAT_REPLY_TOUR_KEY,
} from "@/features/product-tour/tours/client-tours"
import { findVisibleAnchor } from "@/features/product-tour/utils/tour-steps"
import {
  hasSeenTour,
  pageTourKey,
} from "@/features/product-tour/utils/tour-storage"

const POLL_MS = 500

// Explains citations and reporting once, right after the first answer has
// finished streaming. It waits for any tour already open (the chat page
// tour on a first visit) instead of interrupting it.
export function useChatReplyTour(hasCompletedReply: boolean) {
  const { run } = useTourRunner()

  useEffect(() => {
    const key = pageTourKey(CHAT_REPLY_TOUR_KEY)
    if (!hasCompletedReply || hasSeenTour(key)) return

    const timer = window.setInterval(() => {
      if (hasSeenTour(key)) {
        window.clearInterval(timer)
      } else if (
        findVisibleAnchor(TOUR_ANCHORS.chatReplyActions) &&
        !isTourActive()
      ) {
        window.clearInterval(timer)
        run(CHAT_REPLY_STEPS, [key])
      }
    }, POLL_MS)

    return () => window.clearInterval(timer)
  }, [hasCompletedReply, run])
}
