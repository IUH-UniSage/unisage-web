import { Outlet } from "react-router-dom"

export function ChatLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Outlet />
    </div>
  )
}
