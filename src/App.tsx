import { Suspense } from "react"
import { RouterProvider } from "react-router-dom"

import { AppProviders } from "@/app/app-providers"
import { AppRouteFallback } from "@/app/app-route-fallback"
import { router } from "@/routes"

export function App() {
  return (
    <AppProviders>
      <Suspense fallback={<AppRouteFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProviders>
  )
}

export default App
