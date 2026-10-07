import { CircleHelp } from "lucide-react"
import { NavLink } from "react-router-dom"

import { BrandLogo } from "@/components/shared/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/paths"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { useVisibleNavItems } from "@/components/shared/navigation/use-visible-nav-items"
import type { StaffWorkspace } from "@/routes/feature-registry"
import { cn } from "@/lib/utils"

export type { StaffWorkspace }

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
  const visibleNavigation = useVisibleNavItems(workspace)

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

      <nav
        {...tourAnchor(TOUR_ANCHORS.sidebarNav)}
        aria-label={`Điều hướng ${workspaceLabel}`}
        className="flex-1 p-3"
      >
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
