import type { RouteObject } from "react-router-dom"

import { ROUTES } from "@/constants/paths"
import { USER_ROLES } from "@/features/auth/utils/role-routing"
import { IngesterLayout } from "@/layouts/ingester-layout"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"
import { buildWorkspaceRouteChildren } from "@/routes/feature-registry"
import { PrivateRoute } from "@/routes/private-route"

export const ingesterRoutes: RouteObject = {
  path: ROUTES.ingester,
  element: (
    <PrivateRoute allowedRoles={[USER_ROLES.ingestAdmin]}>
      <IngesterLayout />
    </PrivateRoute>
  ),
  children: [
    ...buildWorkspaceRouteChildren("ingester"),
    {
      path: "*",
      element: <WorkspacePlaceholderPage title="Không gian nạp tài liệu" />,
    },
  ],
}
