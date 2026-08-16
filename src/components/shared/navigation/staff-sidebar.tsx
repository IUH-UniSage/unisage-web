import type { LucideIcon } from "lucide-react"
import {
  Activity,
  BookOpen,
  Bot,
  CircleHelp,
  FileText,
  Gauge,
  HeartPulse,
  LogOut,
  Settings,
  ShieldCheck,
  UploadCloud,
  Users,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { BrandLogo } from "@/components/shared/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/paths"
import { cn } from "@/lib/utils"

export type StaffWorkspace = "ingester" | "system-admin"

type NavigationItem = {
  icon: LucideIcon
  label: string
  to: string
}

const navigation: Record<StaffWorkspace, NavigationItem[]> = {
  ingester: [
    { icon: Gauge, label: "Tổng quan", to: ROUTES.ingester },
    { icon: FileText, label: "Tài liệu", to: ROUTES.ingesterDocuments },
    { icon: UploadCloud, label: "Đang xử lý", to: ROUTES.ingesterProcessing },
    {
      icon: ShieldCheck,
      label: "Kiểm tra chất lượng",
      to: ROUTES.ingesterQuality,
    },
    { icon: Settings, label: "Cài đặt", to: ROUTES.ingesterSettings },
  ],
  "system-admin": [
    { icon: Gauge, label: "Tổng quan", to: ROUTES.admin },
    { icon: Users, label: "Quản lý người dùng", to: ROUTES.adminUsers },
    {
      icon: BookOpen,
      label: "Quản trị tài liệu",
      to: ROUTES.adminDocuments,
    },
    { icon: Activity, label: "Nhật ký hệ thống", to: ROUTES.adminLogs },
    { icon: Bot, label: "Cấu hình AI", to: ROUTES.adminModels },
    { icon: HeartPulse, label: "Tình trạng dịch vụ", to: ROUTES.adminHealth },
    { icon: Settings, label: "Cài đặt", to: ROUTES.adminSettings },
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
  const workspaceLabel =
    workspace === "ingester" ? "Nạp tài liệu" : "Quản trị hệ thống"

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
          {navigation[workspace].map((item) => {
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
        <Button
          className="w-full justify-start text-white/76 hover:bg-white/10 hover:text-white"
          variant="ghost"
        >
          <LogOut aria-hidden="true" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  )
}
