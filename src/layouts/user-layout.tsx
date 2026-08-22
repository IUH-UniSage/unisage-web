import { Outlet } from "react-router-dom"

import { ThemeToggle } from "@/components/shared/theme-toggle"

export function UserLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4">
        <span className="text-sm font-semibold">UniSage</span>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
