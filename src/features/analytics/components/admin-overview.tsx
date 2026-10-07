import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  Bot,
  FileText,
  Gauge,
  Server,
  TicketCheck,
  Users,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ROUTES } from "@/constants/paths"
import { useDashboardSummaryQuery } from "@/features/analytics/queries/use-queries"
import { PermissionGate } from "@/features/auth/components/permission-gate"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
import { HealthStatusBadge } from "@/features/system-health/components/health-status-badge"
import {
  getComponentLabel,
  type ComponentHealth,
} from "@/features/system-health/schemas/system-health-schemas"
import { formatDate } from "@/utils/date"
import { getErrorMessage } from "@/utils/error-handler"
import type { PermissionRequirement } from "@/utils/permissions"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

function formatWeekday(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return WEEKDAY_LABELS[date.getDay()]
}

function formatCheckedAt(isoDateTime: string): string {
  const formatted = formatDate(isoDateTime, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
  return formatted === "-" ? isoDateTime : formatted
}

export function AdminOverviewPage() {
  const summaryQuery = useDashboardSummaryQuery()

  if (summaryQuery.isPending) {
    return <DashboardSkeleton />
  }

  if (summaryQuery.isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 shadow-none">
        <CardContent className="p-6 text-sm font-medium text-destructive">
          Không thể tải dữ liệu tổng quan: {getErrorMessage(summaryQuery.error)}
        </CardContent>
      </Card>
    )
  }

  const summary = summaryQuery.data
  const maxQuestions = Math.max(
    1,
    ...summary.weeklyActivity.daily.map((day) => day.questions)
  )
  const avgQuestionsPerDay = Math.round(
    summary.weeklyActivity.totalQuestions / summary.weeklyActivity.daily.length
  )

  const overviewMetrics = [
    {
      detail: `${summary.users.activeToday.toLocaleString("vi-VN")} người hoạt động hôm nay`,
      icon: Users,
      label: "Người dùng hoạt động",
      value: summary.users.activeTotal.toLocaleString("vi-VN"),
    },
    {
      detail:
        summary.aiAnswers.citedPercentage != null
          ? `${summary.aiAnswers.citedPercentage}% có nguồn`
          : "Chưa có câu trả lời nào hôm nay",
      icon: Bot,
      label: "Câu trả lời AI hôm nay",
      value: summary.aiAnswers.today.toLocaleString("vi-VN"),
    },
    {
      detail: `Thuộc ${summary.documents.departments.toLocaleString("vi-VN")} phòng ban`,
      icon: FileText,
      label: "Tài liệu đã xuất bản",
      value: summary.documents.published.toLocaleString("vi-VN"),
    },
    {
      detail: "Đang chờ xử lý",
      icon: TicketCheck,
      label: "Yêu cầu đang mở",
      value: summary.tickets.open.toLocaleString("vi-VN"),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div {...tourAnchor(TOUR_ANCHORS.pageHeader)}>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Điều hành nền tảng
          </p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            Tổng quan hệ thống
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Theo dõi mức độ sử dụng, chất lượng tri thức, nhu cầu hỗ trợ và các
            dịch vụ cốt lõi.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
          <span className="size-2 rounded-full bg-success" />
          Cập nhật lúc {formatCheckedAt(summary.health.checkedAt)}
        </div>
      </div>

      <div
        {...tourAnchor(TOUR_ANCHORS.overviewMetrics)}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {overviewMetrics.map((metric) => {
          const Icon = metric.icon

          return (
            <Card className="border bg-card shadow-none" key={metric.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold">{metric.value}</p>
                  </div>
                  <div className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {metric.detail}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <Card
          {...tourAnchor(TOUR_ANCHORS.overviewActivity)}
          className="border bg-card shadow-none"
        >
          <CardHeader className="flex-row items-center justify-between gap-4 border-b">
            <div>
              <CardTitle>Hoạt động nền tảng</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Số câu hỏi AI đã trả lời trong bảy ngày gần nhất
              </p>
            </div>
            <Badge variant="secondary">7 ngày</Badge>
          </CardHeader>
          <CardContent className="p-5 md:p-6">
            <div className="flex h-64 items-end gap-3 rounded-xl bg-[linear-gradient(to_bottom,var(--background)_0,var(--card)_100%)] p-4 md:gap-5">
              {summary.weeklyActivity.daily.map((day) => (
                <div
                  className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
                  key={day.date}
                >
                  <p className="text-center text-[10px] font-medium text-muted-foreground">
                    {day.questions.toLocaleString("vi-VN")}
                  </p>
                  <div
                    className="min-h-1 rounded-t-lg bg-primary transition-opacity hover:opacity-80"
                    style={{
                      height: `${Math.max(2, (day.questions / maxQuestions) * 100)}%`,
                    }}
                  />
                  <span className="text-center text-[10px] text-muted-foreground">
                    {formatWeekday(day.date)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MiniStat
                label="Tổng câu hỏi (7 ngày)"
                value={summary.weeklyActivity.totalQuestions.toLocaleString(
                  "vi-VN"
                )}
              />
              <MiniStat
                label="Trung bình mỗi ngày"
                value={avgQuestionsPerDay.toLocaleString("vi-VN")}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          {...tourAnchor(TOUR_ANCHORS.overviewHealth)}
          className="border bg-card shadow-none"
        >
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Tình trạng dịch vụ</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Các dịch vụ phụ thuộc theo thời gian thực
              </p>
            </div>
            <Gauge aria-hidden="true" className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(summary.health.components).map(
              ([key, component]) => (
                <ServiceRow
                  component={component}
                  key={key}
                  name={getComponentLabel(key)}
                />
              )
            )}
            <PermissionGate
              requiredPermissions={PERMISSION_POLICIES.adminHealth}
            >
              <NavButton
                label="Mở trang tình trạng dịch vụ"
                to={ROUTES.adminHealth}
              />
            </PermissionGate>
          </CardContent>
        </Card>
      </div>

      <div
        {...tourAnchor(TOUR_ANCHORS.overviewShortcuts)}
        className="grid gap-4 md:grid-cols-3"
      >
        <ActionCard
          description="Rà soát phân quyền và các bất thường truy cập."
          icon={Users}
          requiredPermissions={PERMISSION_POLICIES.adminUsers}
          title="Quản trị người dùng"
          to={ROUTES.adminUsers}
        />
        <ActionCard
          description="Theo dõi mức sử dụng, độ trễ và kiểm soát chi phí."
          icon={Server}
          requiredPermissions={PERMISSION_POLICIES.adminModels}
          title="Nhà cung cấp AI"
          to={ROUTES.adminModels}
        />
        <ActionCard
          description={`${summary.tickets.open.toLocaleString("vi-VN")} yêu cầu hỗ trợ đang chờ xử lý.`}
          icon={TicketCheck}
          requiredPermissions={PERMISSION_POLICIES.adminTickets}
          title="Yêu cầu hỗ trợ"
          to={ROUTES.adminTickets}
        />
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background p-4">
      <p className="text-lg font-bold">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function ServiceRow({
  component,
  name,
}: {
  component: ComponentHealth
  name: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">{name}</p>
        <div className="mt-1.5">
          <HealthStatusBadge status={component.status} />
        </div>
      </div>
      {component.responseTimeMs != null ? (
        <span className="text-[11px] font-medium text-muted-foreground">
          {component.responseTimeMs} ms
        </span>
      ) : null}
    </div>
  )
}

function NavButton({ label, to }: { label: string; to: string }) {
  const navigate = useNavigate()
  return (
    <Button
      className="mt-2 w-full"
      onClick={() => navigate(to)}
      variant="outline"
    >
      {label}
      <ArrowRight aria-hidden="true" />
    </Button>
  )
}

function ActionCard({
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
  const navigate = useNavigate()

  return (
    <PermissionGate requiredPermissions={requiredPermissions}>
      <Card className="border bg-card shadow-none">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
            <Icon aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
          <Button
            aria-label={`Mở ${title}`}
            onClick={() => navigate(to)}
            size="icon-sm"
            variant="ghost"
          >
            <ArrowRight aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    </PermissionGate>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Đang tải tổng quan hệ thống">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-155 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}
