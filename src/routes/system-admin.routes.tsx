import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import { ROUTES } from "@/constants/paths"
import { USER_ROLES } from "@/features/auth/lib/role-routing"
import { SystemAdminLayout } from "@/layouts/system-admin-layout"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"
import { PrivateRoute } from "@/routes/private-route"

const AdminOverviewPage = lazy(async () => {
  const { AdminOverviewPage } =
    await import("@/pages/system-admin/admin-overview-page")
  return { default: AdminOverviewPage }
})

export const systemAdminRoutes: RouteObject = {
  path: ROUTES.admin,
  element: (
    <PrivateRoute allowedRoles={[USER_ROLES.superAdmin]}>
      <SystemAdminLayout />
    </PrivateRoute>
  ),
  children: [
    {
      index: true,
      element: <AdminOverviewPage />,
    },
    {
      path: "*",
      element: (
        <WorkspacePlaceholderPage title="Không gian quản trị hệ thống" />
      ),
    },
  ],
}
