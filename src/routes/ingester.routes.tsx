import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import { ROUTES } from "@/constants/paths"
import { USER_ROLES } from "@/features/auth/lib/role-routing"
import { IngesterLayout } from "@/layouts/ingester-layout"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"
import { PrivateRoute } from "@/routes/private-route"

const IngesterDashboardPage = lazy(async () => {
  const { IngesterDashboardPage } =
    await import("@/pages/ingester/ingester-dashboard-page")
  return { default: IngesterDashboardPage }
})

export const ingesterRoutes: RouteObject = {
  path: ROUTES.ingester,
  element: (
    <PrivateRoute allowedRoles={[USER_ROLES.ingestAdmin]}>
      <IngesterLayout />
    </PrivateRoute>
  ),
  children: [
    {
      index: true,
      element: <IngesterDashboardPage />,
    },
    {
      path: "*",
      element: <WorkspacePlaceholderPage title="Không gian nạp tài liệu" />,
    },
  ],
}
