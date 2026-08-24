import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import { ROUTE_SEGMENTS, ROUTES } from "@/constants/paths"
import { USER_ROLES } from "@/features/auth/utils/role-routing"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
import { SystemAdminLayout } from "@/layouts/system-admin-layout"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"
import { buildWorkspaceRouteChildren } from "@/routes/feature-registry"
import { PermissionRoute } from "@/routes/permission-route"
import { PrivateRoute } from "@/routes/private-route"

const IngestWizardPage = lazy(async () => {
  const { IngestWizardPage } =
    await import("@/pages/ingester/ingest-wizard-page")
  return { default: IngestWizardPage }
})

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
      element: (
        <PermissionRoute
          requiredPermissions={PERMISSION_POLICIES.ingesterProcessing}
        >
          <IngestWizardPage backTo={ROUTES.adminDocuments} />
        </PermissionRoute>
      ),
      path: `${ROUTE_SEGMENTS.documents}/:documentId/ingest`,
    },
    {
      path: "*",
      element: (
        <WorkspacePlaceholderPage title="Không gian quản trị hệ thống" />
      ),
    },
  ],
}
