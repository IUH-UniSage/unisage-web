import { createBrowserRouter } from "react-router-dom"

import { NotFoundPage } from "@/pages/errors/not-found-page"
import { authRoutes } from "@/routes/auth.routes"
import { getDocumentTitle } from "@/routes/document-title"
import { ingesterRoutes } from "@/routes/ingester.routes"
import { systemAdminRoutes } from "@/routes/system-admin.routes"
import { userRoutes } from "@/routes/user.routes"

export const router = createBrowserRouter([
  authRoutes,
  ingesterRoutes,
  systemAdminRoutes,
  ...userRoutes,
  {
    path: "*",
    element: <NotFoundPage />,
  },
])

// Per-page browser tab title, kept in sync on every navigation.
document.title = getDocumentTitle(router.state.location.pathname)
router.subscribe((state) => {
  document.title = getDocumentTitle(state.location.pathname)
})
