import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import { ROUTES } from "@/constants/paths"
import { SystemAdminLayout } from "@/layouts/system-admin-layout"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"

const AdminOverviewPage = lazy(async () => {
  const { AdminOverviewPage } =
    await import("@/pages/system-admin/admin-overview-page")
  return { default: AdminOverviewPage }
})

export const systemAdminRoutes: RouteObject = {
  path: ROUTES.admin,
  element: <SystemAdminLayout />,
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
