import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import { ROUTE_SEGMENTS, ROUTES } from "@/constants/paths"
import { USER_ROLES } from "@/features/auth/utils/role-routing"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
import { IngesterLayout } from "@/layouts/ingester-layout"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"
import { buildWorkspaceRouteChildren } from "@/routes/feature-registry"
import { PermissionRoute } from "@/routes/permission-route"
import { PrivateRoute } from "@/routes/private-route"

const IngestWizardPage = lazy(async () => {
  const { IngestWizardPage } =
    await import("@/pages/ingester/ingest-wizard-page")
  return { default: IngestWizardPage }
})

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
      element: (
        <PermissionRoute
          requiredPermissions={PERMISSION_POLICIES.ingesterProcessing}
        >
          <IngestWizardPage />
        </PermissionRoute>
      ),
      path: `${ROUTE_SEGMENTS.processing}/:documentId`,
    },
    {
      path: "*",
      element: <WorkspacePlaceholderPage title="Không gian nạp tài liệu" />,
    },
  ],
}
