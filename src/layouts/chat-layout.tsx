import { Outlet } from "react-router-dom"

import { ClientOverviewTour } from "@/features/product-tour"
import { useVisualViewport } from "@/hooks/use-visual-viewport"

export function ChatLayout() {
  // Fixed to the visible part of the screen, so the on-screen keyboard shrinks
  // the chat (header stays, composer sits on the keyboard) instead of pushing
  // the whole page up.
  useVisualViewport()

  return (
    <main className="fixed inset-x-0 top-[var(--app-top,0px)] h-[var(--app-height,100svh)] overflow-hidden overscroll-none bg-background">
      <ClientOverviewTour />
      <Outlet />
    </main>
  )
}
