import type { RouteObject } from "react-router-dom"

import { IngesterLayout } from "@/layouts/ingester-layout"
import { IngesterDashboardPage } from "@/pages/ingester/ingester-dashboard-page"

export const ingesterRoutes: RouteObject = {
  path: "ingester",
  element: <IngesterLayout />,
  children: [{ index: true, element: <IngesterDashboardPage /> }],
}
