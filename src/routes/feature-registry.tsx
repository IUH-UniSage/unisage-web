import type { LucideIcon } from "lucide-react"
import {
  Activity,
  BookOpen,
  Bot,
  Building,
  Gauge,
  HeartPulse,
  Hourglass,
  Layers,
  LifeBuoy,
  Settings,
  ShieldCheck,
  ShieldPlus,
  Tags,
  UploadCloud,
  Users,
  Wallet,
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
//
// Note this is deliberately NOT "show a feature anywhere the user happens to
// hold the matching permission" - which workspace(s) is more of an
// information-architecture decision than a permission one (a stray
// USER_READ grant shouldn't make "Quản lý người dùng" appear in Ingester).
// `workspaces` still has to be authored per feature; what this registry
// removes is having to author it *twice* (once as a route, once as a nav
// item) per workspace.
export type StaffWorkspace = "ingester" | "system-admin"

export type NavigationItem = {
  icon: LucideIcon
  key: string
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
  // Every workspace this feature appears in. A feature usable from more
  // than one workspace (e.g. Category/Document/Department, which content
  // staff and admins both manage) is ONE entry listing every workspace,
  // not one entry per workspace - so registering it for a new workspace
  // can't be forgotten the way a second near-duplicate entry can (this bit
  // us once already: Department was added for system-admin only, and
  // INGEST_ADMIN's existing DEPARTMENT_READ permission had nowhere to
  // apply until this entry gained "ingester" too).
  workspaces: StaffWorkspace[]
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

const TicketPage = lazy(async () => {
  const { TicketPage } = await import("@/pages/system-admin/ticket-page")
  return { default: TicketPage }
})

const UsageLimitPage = lazy(async () => {
  const { UsageLimitPage } =
    await import("@/pages/system-admin/usage-limit-page")
  return { default: UsageLimitPage }
})

const DepartmentPage = lazy(async () => {
  const { DepartmentPage } = await import("@/pages/shared/department-page")
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

const IngesterProcessingPage = lazy(async () => {
  const { IngesterProcessingPage } =
    await import("@/pages/ingester/ingester-processing-page")
  return { default: IngesterProcessingPage }
})

const ChatModelPage = lazy(async () => {
  const { ChatModelPage } = await import("@/pages/system-admin/chat-model-page")
  return { default: ChatModelPage }
})

const CostManagementPage = lazy(async () => {
  const { CostManagementPage } =
    await import("@/pages/system-admin/cost-management-page")
  return { default: CostManagementPage }
})

const SystemSettingsPage = lazy(async () => {
  const { SystemSettingsPage } =
    await import("@/pages/system-admin/system-settings-page")
  return { default: SystemSettingsPage }
})

const AuditLogPage = lazy(async () => {
  const { AuditLogPage } = await import("@/pages/system-admin/audit-log-page")
  return { default: AuditLogPage }
})

const SystemHealthPage = lazy(async () => {
  const { SystemHealthPage } =
    await import("@/pages/system-admin/system-health-page")
  return { default: SystemHealthPage }
})

// Array order = nav display order, per workspace, in the order each
// workspace's filtered view encounters entries - see getWorkspaceFeatures().
// Placing an entry earlier moves it earlier in every workspace it belongs
// to, so a shared entry's position is a compromise across all of them; the
// order below was chosen to match system-admin's requested order (Tổng
// quan, Phòng ban, Quản lý người dùng, ...) while keeping ingester's
// content items (Phòng ban/Danh mục/Quản trị tài liệu) grouped right after
// its own overview.
export const FEATURE_REGISTRY: FeatureEntry[] = [
  {
    element: <AdminOverviewPage />,
    icon: Gauge,
    key: "admin-overview",
    label: "Tổng quan",
    workspaces: ["system-admin"],
  },
  {
    element: <IngesterDashboardPage />,
    fallback: <AccessDeniedPage />,
    icon: Gauge,
    key: "ingester-overview",
    label: "Tổng quan",
    requiredPermissions: PERMISSION_POLICIES.ingesterOverview,
    workspaces: ["ingester"],
  },
  {
    element: <DepartmentPage />,
    icon: Building,
    key: "departments",
    label: "Phòng ban",
    requiredPermissions: PERMISSION_POLICIES.departments,
    segment: ROUTE_SEGMENTS.departments,
    workspaces: ["system-admin", "ingester"],
  },
  {
    element: <UserPage />,
    icon: Users,
    key: "admin-users",
    label: "Quản lý người dùng",
    requiredPermissions: PERMISSION_POLICIES.adminUsers,
    segment: ROUTE_SEGMENTS.users,
    workspaces: ["system-admin"],
  },
  {
    element: <RbacPage />,
    icon: ShieldPlus,
    key: "admin-rbac",
    label: "Vai trò & phân quyền",
    requiredPermissions: PERMISSION_POLICIES.adminRbac,
    requiredStrategy: "all",
    segment: ROUTE_SEGMENTS.rbac,
    workspaces: ["system-admin"],
  },
  {
    element: <AccessLevelPage />,
    icon: Layers,
    key: "admin-access-levels",
    label: "Cấp độ truy cập",
    requiredPermissions: PERMISSION_POLICIES.adminAccessLevels,
    segment: ROUTE_SEGMENTS.accessLevels,
    workspaces: ["system-admin"],
  },
  {
    element: <TicketPage />,
    icon: LifeBuoy,
    key: "admin-tickets",
    label: "Yêu cầu hỗ trợ",
    requiredPermissions: PERMISSION_POLICIES.adminTickets,
    segment: ROUTE_SEGMENTS.tickets,
    workspaces: ["system-admin"],
  },
  {
    element: <UsageLimitPage />,
    icon: Hourglass,
    key: "admin-usage-limits",
    label: "Cấu hình hạn mức",
    requiredPermissions: PERMISSION_POLICIES.adminUsageLimits,
    segment: ROUTE_SEGMENTS.usageLimits,
    workspaces: ["system-admin"],
  },
  {
    element: <CategoryPage />,
    icon: Tags,
    key: "categories",
    label: "Danh mục tài liệu",
    requiredPermissions: PERMISSION_POLICIES.categories,
    segment: ROUTE_SEGMENTS.categories,
    workspaces: ["system-admin", "ingester"],
  },
  {
    element: <DocumentPage />,
    icon: BookOpen,
    key: "documents",
    label: "Quản trị tài liệu",
    requiredPermissions: PERMISSION_POLICIES.documents,
    segment: ROUTE_SEGMENTS.documents,
    workspaces: ["system-admin", "ingester"],
  },
  {
    element: <AuditLogPage />,
    icon: Activity,
    key: "admin-logs",
    label: "Nhật ký hệ thống",
    requiredPermissions: PERMISSION_POLICIES.adminLogs,
    segment: ROUTE_SEGMENTS.logs,
    workspaces: ["system-admin"],
  },
  {
    element: <ChatModelPage />,
    icon: Bot,
    key: "admin-models",
    label: "Cấu hình AI",
    requiredPermissions: PERMISSION_POLICIES.adminModels,
    segment: ROUTE_SEGMENTS.models,
    workspaces: ["system-admin"],
  },
  {
    element: <CostManagementPage />,
    icon: Wallet,
    key: "admin-cost-management",
    label: "Chi phí AI",
    requiredPermissions: PERMISSION_POLICIES.costManagement,
    segment: ROUTE_SEGMENTS.costManagement,
    workspaces: ["system-admin"],
  },
  {
    element: <SystemHealthPage />,
    icon: HeartPulse,
    key: "admin-health",
    label: "Tình trạng dịch vụ",
    requiredPermissions: PERMISSION_POLICIES.adminHealth,
    segment: ROUTE_SEGMENTS.health,
    workspaces: ["system-admin"],
  },
  {
    element: <SystemSettingsPage />,
    icon: Settings,
    key: "admin-settings",
    label: "Cài đặt",
    requiredPermissions: PERMISSION_POLICIES.adminSettings,
    segment: ROUTE_SEGMENTS.settings,
    workspaces: ["system-admin"],
  },
  {
    element: <IngesterProcessingPage />,
    icon: UploadCloud,
    key: "ingester-processing",
    label: "Đang xử lý",
    requiredPermissions: PERMISSION_POLICIES.ingesterProcessing,
    segment: ROUTE_SEGMENTS.processing,
    workspaces: ["ingester"],
  },
  {
    element: <WorkspacePlaceholderPage title="Kiểm tra chất lượng" />,
    icon: ShieldCheck,
    key: "ingester-quality",
    label: "Kiểm tra chất lượng",
    requiredPermissions: PERMISSION_POLICIES.ingesterQuality,
    segment: ROUTE_SEGMENTS.quality,
    workspaces: ["ingester"],
  },
  {
    element: <WorkspacePlaceholderPage title="Cài đặt nạp liệu" />,
    icon: Settings,
    key: "ingester-settings",
    label: "Cài đặt",
    requiredPermissions: PERMISSION_POLICIES.ingesterSettings,
    segment: ROUTE_SEGMENTS.settings,
    workspaces: ["ingester"],
  },
]

function workspaceRoot(workspace: StaffWorkspace): string {
  return workspace === "system-admin" ? ROUTES.admin : ROUTES.ingester
}

export function getWorkspaceFeatures(
  workspace: StaffWorkspace
): FeatureEntry[] {
  return FEATURE_REGISTRY.filter((entry) =>
    entry.workspaces.includes(workspace)
  )
}

export function getWorkspaceNavItems(
  workspace: StaffWorkspace
): NavigationItem[] {
  const root = workspaceRoot(workspace)

  return getWorkspaceFeatures(workspace).map((entry) => ({
    icon: entry.icon,
    key: entry.key,
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
