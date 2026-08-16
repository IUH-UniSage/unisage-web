import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import { ROUTE_SEGMENTS, ROUTES } from "@/constants/paths"
import { USER_ROLES } from "@/features/auth/lib/role-routing"
import { PERMISSION_POLICIES } from "@/features/auth/lib/permission-policies"
import { SystemAdminLayout } from "@/layouts/system-admin-layout"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"
import { PermissionRoute } from "@/routes/permission-route"
import { PrivateRoute } from "@/routes/private-route"

const AdminOverviewPage = lazy(async () => {
  const { AdminOverviewPage } =
    await import("@/pages/system-admin/admin-overview-page")
  return { default: AdminOverviewPage }
})

const AccessControlPage = lazy(async () => {
  const { AccessControlPage } =
    await import("@/pages/system-admin/access-control-page")
  return { default: AccessControlPage }
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
      path: ROUTE_SEGMENTS.users,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.admin}
          requiredPermissions={PERMISSION_POLICIES.adminUsers}
          strategy="any"
        >
          <WorkspacePlaceholderPage title="Quản lý người dùng" />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.accessControl,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.admin}
          requiredPermissions={PERMISSION_POLICIES.adminAccessControl}
          strategy="all"
        >
          <AccessControlPage />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.documents,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.admin}
          requiredPermissions={PERMISSION_POLICIES.adminDocuments}
          strategy="any"
        >
          <WorkspacePlaceholderPage title="Quản trị tài liệu" />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.logs,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.admin}
          requiredPermissions={PERMISSION_POLICIES.adminLogs}
          strategy="any"
        >
          <WorkspacePlaceholderPage title="Nhật ký hệ thống" />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.models,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.admin}
          requiredPermissions={PERMISSION_POLICIES.adminModels}
          strategy="any"
        >
          <WorkspacePlaceholderPage title="Cấu hình AI" />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.health,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.admin}
          requiredPermissions={PERMISSION_POLICIES.adminHealth}
          strategy="any"
        >
          <WorkspacePlaceholderPage title="Tình trạng dịch vụ" />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.settings,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.admin}
          requiredPermissions={PERMISSION_POLICIES.adminSettings}
          strategy="any"
        >
          <WorkspacePlaceholderPage title="Cài đặt hệ thống" />
        </PermissionRoute>
      ),
    },
    {
      path: "*",
      element: (
        <WorkspacePlaceholderPage title="Không gian quản trị hệ thống" />
      ),
    },
  ],
}
