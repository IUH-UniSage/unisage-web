import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import { ROUTE_SEGMENTS, ROUTES } from "@/constants/paths"
import { PERMISSION_POLICIES } from "@/features/auth/lib/permission-policies"
import { USER_ROLES } from "@/features/auth/lib/role-routing"
import { IngesterLayout } from "@/layouts/ingester-layout"
import { AccessDeniedPage } from "@/pages/errors/access-denied-page"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"
import { PermissionRoute } from "@/routes/permission-route"
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
      element: (
        <PermissionRoute
          fallback={<AccessDeniedPage />}
          requiredPermissions={PERMISSION_POLICIES.ingesterOverview}
          strategy="any"
        >
          <IngesterDashboardPage />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.documents,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.ingester}
          requiredPermissions={PERMISSION_POLICIES.ingesterDocuments}
          strategy="any"
        >
          <WorkspacePlaceholderPage title="Tài liệu nạp liệu" />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.processing,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.ingester}
          requiredPermissions={PERMISSION_POLICIES.ingesterProcessing}
          strategy="any"
        >
          <WorkspacePlaceholderPage title="Hàng đợi xử lý" />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.quality,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.ingester}
          requiredPermissions={PERMISSION_POLICIES.ingesterQuality}
          strategy="any"
        >
          <WorkspacePlaceholderPage title="Kiểm tra chất lượng" />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.settings,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.ingester}
          requiredPermissions={PERMISSION_POLICIES.ingesterSettings}
          strategy="any"
        >
          <WorkspacePlaceholderPage title="Cài đặt nạp liệu" />
        </PermissionRoute>
      ),
    },
    {
      path: "*",
      element: <WorkspacePlaceholderPage title="Không gian nạp tài liệu" />,
    },
  ],
}
