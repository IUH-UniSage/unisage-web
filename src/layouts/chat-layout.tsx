import { Outlet } from "react-router-dom"

import { ClientOverviewTour } from "@/features/product-tour"

export function ChatLayout() {
  return (
    <main className="h-svh overflow-hidden bg-background">
      <ClientOverviewTour />
      <Outlet />
    </main>
  )
}
