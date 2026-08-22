import { useRoutes } from "react-router-dom"

import { NotFoundPage } from "@/pages/errors/not-found-page"
import { authRoutes } from "@/routes/auth.routes"
import { ingesterRoutes } from "@/routes/ingester.routes"
import { systemAdminRoutes } from "@/routes/system-admin.routes"
import { userRoutes } from "@/routes/user.routes"

export function AppRoutes() {
  return useRoutes([
    ...userRoutes,
    authRoutes,
    ingesterRoutes,
    systemAdminRoutes,
    { path: "*", element: <NotFoundPage /> },
  ])
}
