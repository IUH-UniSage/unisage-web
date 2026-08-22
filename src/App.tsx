import { Suspense } from "react"

import { AppRouteFallback } from "@/app/app-route-fallback"
import { AppRoutes } from "@/routes"

function App() {
  return (
    <Suspense fallback={<AppRouteFallback />}>
      <AppRoutes />
    </Suspense>
  )
}

export default App
