import type { RouteObject } from "react-router-dom"

import { ROUTES } from "@/constants/paths"
import { USER_ROLES } from "@/features/auth/utils/role-routing"
import { SystemAdminLayout } from "@/layouts/system-admin-layout"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"
import { buildWorkspaceRouteChildren } from "@/routes/feature-registry"
import { PrivateRoute } from "@/routes/private-route"

export const systemAdminRoutes: RouteObject = {
  path: ROUTES.admin,
  element: (
    <PrivateRoute allowedRoles={[USER_ROLES.superAdmin]}>
      <SystemAdminLayout />
    </PrivateRoute>
  ),
  children: [
    ...buildWorkspaceRouteChildren("system-admin"),
    {
      path: "*",
      element: (
        <WorkspacePlaceholderPage title="Không gian quản trị hệ thống" />
      ),
    },
  ],
}
