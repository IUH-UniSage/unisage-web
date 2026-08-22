import { Outlet } from "react-router-dom"

export function ChatLayout() {
  return (
    <main className="h-svh overflow-hidden bg-background">
      <Outlet />
    </main>
  )
}
