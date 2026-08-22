import { createBrowserRouter } from "react-router-dom"

import { NotFoundPage } from "@/pages/errors/not-found-page"
import { authRoutes } from "@/routes/auth.routes"
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
