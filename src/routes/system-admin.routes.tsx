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

const ProfilePage = lazy(async () => {
  const { ProfilePage } = await import("@/pages/system-admin/profile-page")
  return { default: ProfilePage }
})

const UserDetailPage = lazy(async () => {
  const { UserDetailPage } =
    await import("@/pages/system-admin/user-detail-page")
  return { default: UserDetailPage }
})

const UserFormPage = lazy(async () => {
  const { UserFormPage } = await import("@/pages/system-admin/user-form-page")
  return { default: UserFormPage }
})

const RoleDetailPage = lazy(async () => {
  const { RoleDetailPage } =
    await import("@/pages/system-admin/role-detail-page")
  return { default: RoleDetailPage }
})

const RoleFormPage = lazy(async () => {
  const { RoleFormPage } = await import("@/pages/system-admin/role-form-page")
  return { default: RoleFormPage }
})

const DocumentDetailPage = lazy(async () => {
  const { DocumentDetailPage } =
    await import("@/pages/shared/document-detail-page")
  return { default: DocumentDetailPage }
})

const DocumentFormPage = lazy(async () => {
  const { DocumentFormPage } = await import("@/pages/shared/document-form-page")
  return { default: DocumentFormPage }
})

const DocumentChunksPage = lazy(async () => {
  const { DocumentChunksPage } =
    await import("@/pages/shared/document-chunks-page")
  return { default: DocumentChunksPage }
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
      element: (
        <PermissionRoute requiredPermissions={PERMISSION_POLICIES.adminUsers}>
          <UserFormPage />
        </PermissionRoute>
      ),
      path: `${ROUTE_SEGMENTS.users}/new`,
    },
    {
      element: (
        <PermissionRoute requiredPermissions={PERMISSION_POLICIES.adminUsers}>
          <UserFormPage />
        </PermissionRoute>
      ),
      path: `${ROUTE_SEGMENTS.users}/:userId/edit`,
    },
    {
      element: (
        <PermissionRoute requiredPermissions={PERMISSION_POLICIES.adminUsers}>
          <UserDetailPage />
        </PermissionRoute>
      ),
      path: `${ROUTE_SEGMENTS.users}/:userId`,
    },
    {
      element: (
        <PermissionRoute
          requiredPermissions={PERMISSION_POLICIES.adminRbac}
          strategy="all"
        >
          <RoleFormPage />
        </PermissionRoute>
      ),
      path: `${ROUTE_SEGMENTS.rbac}/new`,
    },
    {
      element: (
        <PermissionRoute
          requiredPermissions={PERMISSION_POLICIES.adminRbac}
          strategy="all"
        >
          <RoleFormPage />
        </PermissionRoute>
      ),
      path: `${ROUTE_SEGMENTS.rbac}/:roleId/edit`,
    },
    {
      element: (
        <PermissionRoute
          requiredPermissions={PERMISSION_POLICIES.adminRbac}
          strategy="all"
        >
          <RoleDetailPage />
        </PermissionRoute>
      ),
      path: `${ROUTE_SEGMENTS.rbac}/:roleId`,
    },
    {
      element: (
        <PermissionRoute requiredPermissions={PERMISSION_POLICIES.documents}>
          <DocumentFormPage />
        </PermissionRoute>
      ),
      path: `${ROUTE_SEGMENTS.documents}/new`,
    },
    {
      element: (
        <PermissionRoute requiredPermissions={PERMISSION_POLICIES.documents}>
          <DocumentFormPage />
        </PermissionRoute>
      ),
      path: `${ROUTE_SEGMENTS.documents}/:documentId/edit`,
    },
    {
      element: (
        <PermissionRoute requiredPermissions={PERMISSION_POLICIES.documents}>
          <DocumentDetailPage />
        </PermissionRoute>
      ),
      path: `${ROUTE_SEGMENTS.documents}/:documentId`,
    },
    {
      element: (
        <PermissionRoute requiredPermissions={PERMISSION_POLICIES.documents}>
          <DocumentChunksPage />
        </PermissionRoute>
      ),
      path: `${ROUTE_SEGMENTS.documents}/:documentId/chunks`,
    },
    {
      element: <ProfilePage />,
      path: ROUTE_SEGMENTS.profile,
    },
    {
      path: "*",
      element: (
        <WorkspacePlaceholderPage title="Không gian quản trị hệ thống" />
      ),
    },
  ],
}
