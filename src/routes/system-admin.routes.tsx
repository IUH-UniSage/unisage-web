import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import { ROUTE_SEGMENTS, ROUTES } from "@/constants/paths"
import { USER_ROLES } from "@/features/auth/utils/role-routing"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
import { SystemAdminLayout } from "@/layouts/system-admin-layout"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"
import { PermissionRoute } from "@/routes/permission-route"
import { PrivateRoute } from "@/routes/private-route"

const AdminOverviewPage = lazy(async () => {
  const { AdminOverviewPage } =
    await import("@/pages/system-admin/admin-overview-page")
  return { default: AdminOverviewPage }
})

const RbacPage = lazy(async () => {
  const { RbacPage } = await import("@/pages/system-admin/rbac-page")
  return { default: RbacPage }
})

const AccessLevelPage = lazy(async () => {
  const { AccessLevelPage } =
    await import("@/pages/system-admin/access-level-page")
  return { default: AccessLevelPage }
})

const UserPage = lazy(async () => {
  const { UserPage } = await import("@/pages/system-admin/user-page")
  return { default: UserPage }
})

const DepartmentPage = lazy(async () => {
  const { DepartmentPage } =
    await import("@/pages/system-admin/department-page")
  return { default: DepartmentPage }
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
          <UserPage />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.departments,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.admin}
          requiredPermissions={PERMISSION_POLICIES.adminDepartments}
          strategy="any"
        >
          <DepartmentPage />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.rbac,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.admin}
          requiredPermissions={PERMISSION_POLICIES.adminRbac}
          strategy="all"
        >
          <RbacPage />
        </PermissionRoute>
      ),
    },
    {
      path: ROUTE_SEGMENTS.accessLevels,
      element: (
        <PermissionRoute
          fallbackTo={ROUTES.admin}
          requiredPermissions={PERMISSION_POLICIES.adminAccessLevels}
          strategy="any"
        >
          <AccessLevelPage />
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
