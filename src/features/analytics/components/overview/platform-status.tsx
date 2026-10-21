import type { LucideIcon } from "lucide-react"
import { ArrowRight, BookOpen, Server, TicketCheck, Users } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ROUTES } from "@/constants/paths"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import type { DashboardSummary } from "@/features/analytics/schemas/dashboard-schemas"
import { formatCount } from "@/features/analytics/utils/dashboard-format"
import { PermissionGate } from "@/features/auth/components/permission-gate"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
import { HealthStatusBadge } from "@/features/system-health/components/health-status-badge"
import { getComponentLabel } from "@/features/system-health/schemas/system-health-schemas"
import type { PermissionRequirement } from "@/utils/permissions"

export function PlatformStatus({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <ServiceHealthCard summary={summary} />
      <div
        {...tourAnchor(TOUR_ANCHORS.overviewShortcuts)}
        className="grid content-start gap-3"
      >
        <Shortcut
          description={`${formatCount(summary.documents.published)} tài liệu đã xuất bản, thuộc ${formatCount(summary.documents.departments)} phòng ban.`}
          icon={BookOpen}
          requiredPermissions={PERMISSION_POLICIES.documents}
          title="Kho tri thức"
          to={ROUTES.adminDocuments}
        />
        <Shortcut
          description="Model đang dùng, khóa API và độ trễ của nhà cung cấp."
          icon={Server}
          requiredPermissions={PERMISSION_POLICIES.adminModels}
          title="Nhà cung cấp AI"
          to={ROUTES.adminModels}
        />
        <Shortcut
          description="Rà soát tài khoản và phân quyền."
          icon={Users}
          requiredPermissions={PERMISSION_POLICIES.adminUsers}
          title="Quản trị người dùng"
          to={ROUTES.adminUsers}
        />
        <Shortcut
          description={`${formatCount(summary.attention.openTickets)} yêu cầu đang chờ xử lý.`}
          icon={TicketCheck}
          requiredPermissions={PERMISSION_POLICIES.adminTickets}
          title="Yêu cầu hỗ trợ"
          to={ROUTES.adminTickets}
        />
      </div>
    </div>
  )
}

function ServiceHealthCard({ summary }: { summary: DashboardSummary }) {
  return (
    <Card
      {...tourAnchor(TOUR_ANCHORS.overviewHealth)}
      className="border bg-card shadow-none"
    >
      <CardHeader>
        <CardTitle>Tình trạng dịch vụ</CardTitle>
        <CardDescription>
          Các dịch vụ phụ thuộc, kiểm tra theo thời gian thực
        </CardDescription>
        <CardAction>
          <HealthStatusBadge status={summary.health.overallStatus} />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="grid gap-2 sm:grid-cols-2">
          {Object.entries(summary.health.components).map(([key, component]) => (
            <li
              className="flex items-center justify-between gap-3 rounded-xl border p-3"
              key={key}
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">
                  {getComponentLabel(key)}
                </p>
                <div className="mt-1.5">
                  <HealthStatusBadge status={component.status} />
                </div>
              </div>
              {component.responseTimeMs != null ? (
                <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                  {component.responseTimeMs} ms
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        <PermissionGate requiredPermissions={PERMISSION_POLICIES.adminHealth}>
          <Button asChild className="w-full" variant="outline">
            <Link to={ROUTES.adminHealth}>
              Mở trang tình trạng dịch vụ
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </PermissionGate>
      </CardContent>
    </Card>
  )
}

function Shortcut({
  description,
  icon: Icon,
  requiredPermissions,
  title,
  to,
}: {
  description: string
  icon: LucideIcon
  requiredPermissions: readonly PermissionRequirement[]
  title: string
  to: string
}) {
  return (
    <PermissionGate requiredPermissions={requiredPermissions}>
      <Link
        className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        to={to}
      >
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </PermissionGate>
  )
}
