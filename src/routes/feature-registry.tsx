import type { LucideIcon } from "lucide-react"
import {
  Activity,
  BookOpen,
  Bot,
  Building,
  FileText,
  Gauge,
  HeartPulse,
  Layers,
  Settings,
  ShieldCheck,
  ShieldPlus,
  Tags,
  UploadCloud,
  Users,
} from "lucide-react"
import type { ReactNode } from "react"
import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import { ROUTE_SEGMENTS, ROUTES } from "@/constants/paths"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
import { AccessDeniedPage } from "@/pages/errors/access-denied-page"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"
import { PermissionRoute } from "@/routes/permission-route"
import type { PermissionRequirement } from "@/utils/permissions"

// Single source of truth for "what shows up in a staff workspace's sidebar
// nav" and "what routes exist under that workspace" - each FeatureEntry
// drives both, keyed by permission, instead of hand-duplicating the same
// item across a *.routes.tsx file and staff-sidebar.tsx separately.
export type StaffWorkspace = "ingester" | "system-admin"

export type NavigationItem = {
  icon: LucideIcon
  label: string
  requiredPermissions?: readonly PermissionRequirement[]
  requiredStrategy?: "all" | "any"
  to: string
}

export type FeatureEntry = {
  element: ReactNode
  // Rendered instead of a redirect when the permission check fails - only
  // needed for a workspace's index route, where redirecting to its own
  // path (the default fallbackTo) would loop.
  fallback?: ReactNode
  icon: LucideIcon
  key: string
  label: string
  // Omit entirely for a route that PrivateRoute's role gate already covers
  // and needs no further per-feature check (e.g. the admin overview page).
  requiredPermissions?: readonly PermissionRequirement[]
  requiredStrategy?: "all" | "any"
  // Omit for the workspace's index/overview route.
  segment?: string
  workspace: StaffWorkspace
}

const AdminOverviewPage = lazy(async () => {
  const { AdminOverviewPage } =
    await import("@/pages/system-admin/admin-overview-page")
  return { default: AdminOverviewPage }
})

const IngesterDashboardPage = lazy(async () => {
  const { IngesterDashboardPage } =
    await import("@/pages/ingester/ingester-dashboard-page")
  return { default: IngesterDashboardPage }
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

const CategoryPage = lazy(async () => {
  const { CategoryPage } = await import("@/pages/shared/category-page")
  return { default: CategoryPage }
})

const DocumentPage = lazy(async () => {
  const { DocumentPage } = await import("@/pages/shared/document-page")
  return { default: DocumentPage }
})

export const FEATURE_REGISTRY: FeatureEntry[] = [
  // -- system-admin --
  {
    element: <AdminOverviewPage />,
    icon: Gauge,
    key: "admin-overview",
    label: "Tổng quan",
    workspace: "system-admin",
  },
  {
    element: <DepartmentPage />,
    icon: Building,
    key: "admin-departments",
    label: "Phòng ban",
    requiredPermissions: PERMISSION_POLICIES.adminDepartments,
    segment: ROUTE_SEGMENTS.departments,
    workspace: "system-admin",
  },
  {
    element: <UserPage />,
    icon: Users,
    key: "admin-users",
    label: "Quản lý người dùng",
    requiredPermissions: PERMISSION_POLICIES.adminUsers,
    segment: ROUTE_SEGMENTS.users,
    workspace: "system-admin",
  },
  {
    element: <RbacPage />,
    icon: ShieldPlus,
    key: "admin-rbac",
    label: "Vai trò & phân quyền",
    requiredPermissions: PERMISSION_POLICIES.adminRbac,
    requiredStrategy: "all",
    segment: ROUTE_SEGMENTS.rbac,
    workspace: "system-admin",
  },
  {
    element: <AccessLevelPage />,
    icon: Layers,
    key: "admin-access-levels",
    label: "Cấp độ truy cập",
    requiredPermissions: PERMISSION_POLICIES.adminAccessLevels,
    segment: ROUTE_SEGMENTS.accessLevels,
    workspace: "system-admin",
  },
  {
    element: <CategoryPage />,
    icon: Tags,
    key: "admin-categories",
    label: "Danh mục tài liệu",
    requiredPermissions: PERMISSION_POLICIES.adminCategories,
    segment: ROUTE_SEGMENTS.categories,
    workspace: "system-admin",
  },
  {
    element: <DocumentPage />,
    icon: BookOpen,
    key: "admin-documents",
    label: "Quản trị tài liệu",
    requiredPermissions: PERMISSION_POLICIES.adminDocuments,
    segment: ROUTE_SEGMENTS.documents,
    workspace: "system-admin",
  },
  {
    element: <WorkspacePlaceholderPage title="Nhật ký hệ thống" />,
    icon: Activity,
    key: "admin-logs",
    label: "Nhật ký hệ thống",
    requiredPermissions: PERMISSION_POLICIES.adminLogs,
    segment: ROUTE_SEGMENTS.logs,
    workspace: "system-admin",
  },
  {
    element: <WorkspacePlaceholderPage title="Cấu hình AI" />,
    icon: Bot,
    key: "admin-models",
    label: "Cấu hình AI",
    requiredPermissions: PERMISSION_POLICIES.adminModels,
    segment: ROUTE_SEGMENTS.models,
    workspace: "system-admin",
  },
  {
    element: <WorkspacePlaceholderPage title="Tình trạng dịch vụ" />,
    icon: HeartPulse,
    key: "admin-health",
    label: "Tình trạng dịch vụ",
    requiredPermissions: PERMISSION_POLICIES.adminHealth,
    segment: ROUTE_SEGMENTS.health,
    workspace: "system-admin",
  },
  {
    element: <WorkspacePlaceholderPage title="Cài đặt hệ thống" />,
    icon: Settings,
    key: "admin-settings",
    label: "Cài đặt",
    requiredPermissions: PERMISSION_POLICIES.adminSettings,
    segment: ROUTE_SEGMENTS.settings,
    workspace: "system-admin",
  },

  // -- ingester --
  {
    element: <IngesterDashboardPage />,
    fallback: <AccessDeniedPage />,
    icon: Gauge,
    key: "ingester-overview",
    label: "Tổng quan",
    requiredPermissions: PERMISSION_POLICIES.ingesterOverview,
    workspace: "ingester",
  },
  {
    element: <DocumentPage />,
    icon: FileText,
    key: "ingester-documents",
    label: "Tài liệu",
    requiredPermissions: PERMISSION_POLICIES.ingesterDocuments,
    segment: ROUTE_SEGMENTS.documents,
    workspace: "ingester",
  },
  {
    element: <CategoryPage />,
    icon: Tags,
    key: "ingester-categories",
    label: "Danh mục tài liệu",
    requiredPermissions: PERMISSION_POLICIES.ingesterCategories,
    segment: ROUTE_SEGMENTS.categories,
    workspace: "ingester",
  },
  {
    element: <WorkspacePlaceholderPage title="Hàng đợi xử lý" />,
    icon: UploadCloud,
    key: "ingester-processing",
    label: "Đang xử lý",
    requiredPermissions: PERMISSION_POLICIES.ingesterProcessing,
    segment: ROUTE_SEGMENTS.processing,
    workspace: "ingester",
  },
  {
    element: <WorkspacePlaceholderPage title="Kiểm tra chất lượng" />,
    icon: ShieldCheck,
    key: "ingester-quality",
    label: "Kiểm tra chất lượng",
    requiredPermissions: PERMISSION_POLICIES.ingesterQuality,
    segment: ROUTE_SEGMENTS.quality,
    workspace: "ingester",
  },
  {
    element: <WorkspacePlaceholderPage title="Cài đặt nạp liệu" />,
    icon: Settings,
    key: "ingester-settings",
    label: "Cài đặt",
    requiredPermissions: PERMISSION_POLICIES.ingesterSettings,
    segment: ROUTE_SEGMENTS.settings,
    workspace: "ingester",
  },
]

function workspaceRoot(workspace: StaffWorkspace): string {
  return workspace === "system-admin" ? ROUTES.admin : ROUTES.ingester
}

export function getWorkspaceFeatures(
  workspace: StaffWorkspace
): FeatureEntry[] {
  return FEATURE_REGISTRY.filter((entry) => entry.workspace === workspace)
}

export function getWorkspaceNavItems(
  workspace: StaffWorkspace
): NavigationItem[] {
  const root = workspaceRoot(workspace)

  return getWorkspaceFeatures(workspace).map((entry) => ({
    icon: entry.icon,
    label: entry.label,
    requiredPermissions: entry.requiredPermissions,
    requiredStrategy: entry.requiredStrategy,
    to: entry.segment ? `${root}/${entry.segment}` : root,
  }))
}

export function buildWorkspaceRouteChildren(
  workspace: StaffWorkspace
): RouteObject[] {
  const fallbackTo = workspaceRoot(workspace)

  return getWorkspaceFeatures(workspace).map((entry) => {
    const element = entry.requiredPermissions ? (
      <PermissionRoute
        fallback={entry.fallback}
        fallbackTo={fallbackTo}
        requiredPermissions={entry.requiredPermissions}
        strategy={entry.requiredStrategy ?? "any"}
      >
        {entry.element}
      </PermissionRoute>
    ) : (
      entry.element
    )

    return entry.segment
      ? { element, path: entry.segment }
      : { element, index: true }
  })
}
