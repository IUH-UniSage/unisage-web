import type { LucideIcon } from "lucide-react"
import {
  Activity,
  BookOpen,
  Bot,
  Building,
  CircleHelp,
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
import { NavLink } from "react-router-dom"

import { BrandLogo } from "@/components/shared/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/paths"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
import type { PermissionRequirement } from "@/utils/permissions"
import { cn } from "@/lib/utils"

export type StaffWorkspace = "ingester" | "system-admin"

type NavigationItem = {
  icon: LucideIcon
  label: string
  requiredPermissions?: readonly PermissionRequirement[]
  requiredStrategy?: "all" | "any"
  to: string
}

const navigation: Record<StaffWorkspace, NavigationItem[]> = {
  ingester: [
    {
      icon: Gauge,
      label: "Tổng quan",
      requiredPermissions: PERMISSION_POLICIES.ingesterOverview,
      to: ROUTES.ingester,
    },
    {
      icon: FileText,
      label: "Tài liệu",
      requiredPermissions: PERMISSION_POLICIES.ingesterDocuments,
      to: ROUTES.ingesterDocuments,
    },
    {
      icon: UploadCloud,
      label: "Đang xử lý",
      requiredPermissions: PERMISSION_POLICIES.ingesterProcessing,
      to: ROUTES.ingesterProcessing,
    },
    {
      icon: ShieldCheck,
      label: "Kiểm tra chất lượng",
      requiredPermissions: PERMISSION_POLICIES.ingesterQuality,
      to: ROUTES.ingesterQuality,
    },
    {
      icon: Settings,
      label: "Cài đặt",
      requiredPermissions: PERMISSION_POLICIES.ingesterSettings,
      to: ROUTES.ingesterSettings,
    },
  ],
  "system-admin": [
    { icon: Gauge, label: "Tổng quan", to: ROUTES.admin },
    {
      icon: Users,
      label: "Quản lý người dùng",
      requiredPermissions: PERMISSION_POLICIES.adminUsers,
      to: ROUTES.adminUsers,
    },
    {
      icon: Building,
      label: "Phòng ban",
      requiredPermissions: PERMISSION_POLICIES.adminDepartments,
      to: ROUTES.adminDepartments,
    },
    {
      icon: ShieldPlus,
      label: "Vai trò & phân quyền",
      requiredPermissions: PERMISSION_POLICIES.adminRbac,
      requiredStrategy: "all",
      to: ROUTES.adminRbac,
    },
    {
      icon: Layers,
      label: "Cấp độ truy cập",
      requiredPermissions: PERMISSION_POLICIES.adminAccessLevels,
      to: ROUTES.adminAccessLevels,
    },
    {
      icon: Tags,
      label: "Danh mục",
      requiredPermissions: PERMISSION_POLICIES.adminCategories,
      to: ROUTES.adminCategories,
    },
    {
      icon: BookOpen,
      label: "Quản trị tài liệu",
      requiredPermissions: PERMISSION_POLICIES.adminDocuments,
      to: ROUTES.adminDocuments,
    },
    {
      icon: Activity,
      label: "Nhật ký hệ thống",
      requiredPermissions: PERMISSION_POLICIES.adminLogs,
      to: ROUTES.adminLogs,
    },
    {
      icon: Bot,
      label: "Cấu hình AI",
      requiredPermissions: PERMISSION_POLICIES.adminModels,
      to: ROUTES.adminModels,
    },
    {
      icon: HeartPulse,
      label: "Tình trạng dịch vụ",
      requiredPermissions: PERMISSION_POLICIES.adminHealth,
      to: ROUTES.adminHealth,
    },
    {
      icon: Settings,
      label: "Cài đặt",
      requiredPermissions: PERMISSION_POLICIES.adminSettings,
      to: ROUTES.adminSettings,
    },
  ],
}

type StaffSidebarProps = {
  className?: string
  onNavigate?: () => void
  workspace: StaffWorkspace
}

export function StaffSidebar({
  className,
  onNavigate,
  workspace,
}: StaffSidebarProps) {
  const { canAny, canEvery } = usePermissions()
  const workspaceLabel =
    workspace === "ingester" ? "Nạp tài liệu" : "Quản trị hệ thống"
  const visibleNavigation = navigation[workspace].filter(
    ({ requiredPermissions, requiredStrategy = "any" }) =>
      !requiredPermissions ||
      (requiredStrategy === "all"
        ? canEvery(requiredPermissions)
        : canAny(requiredPermissions))
  )

  return (
    <aside
      className={cn(
        "knowledge-network flex h-full w-[248px] flex-col bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="flex h-[72px] items-center border-b border-sidebar-border px-5">
        <BrandLogo inverse workspace={workspaceLabel} />
      </div>

      <nav aria-label={`Điều hướng ${workspaceLabel}`} className="flex-1 p-3">
        <ul className="space-y-1">
          {visibleNavigation.map((item) => {
            const Icon = item.icon

            return (
              <li key={item.to}>
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      "relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-white/76 transition-colors hover:bg-sidebar-accent hover:text-white",
                      isActive && "bg-sidebar-accent text-white"
                    )
                  }
                  end={item.to === ROUTES.ingester || item.to === ROUTES.admin}
                  onClick={onNavigate}
                  to={item.to}
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <span className="absolute inset-y-2 right-0 w-1 rounded-l-full bg-knowledge" />
                      ) : null}
                      <Icon aria-hidden="true" className="size-[18px]" />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-sidebar-border p-3">
        <Button
          className="w-full justify-start border-white/30 bg-transparent text-white hover:bg-white/10"
          variant="outline"
        >
          <CircleHelp aria-hidden="true" />
          Hỗ trợ
        </Button>
        <LogoutButton
          className="w-full justify-start text-white/76 hover:bg-white/10 hover:text-white"
          variant="ghost"
        />
      </div>
    </aside>
  )
}
