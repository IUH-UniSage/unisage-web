import type { RouteObject } from "react-router-dom"

import { SystemAdminLayout } from "@/layouts/system-admin-layout"
import { AdminOverviewPage } from "@/pages/system-admin/admin-overview-page"

export const systemAdminRoutes: RouteObject = {
  path: "admin",
  element: <SystemAdminLayout />,
  children: [{ index: true, element: <AdminOverviewPage /> }],
}
