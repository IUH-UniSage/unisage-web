import type { LucideIcon } from "lucide-react"
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  Gauge,
  Server,
  ShieldAlert,
  TicketCheck,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PermissionGate } from "@/features/auth/components/permission-gate"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
import type { PermissionRequirement } from "@/utils/permissions"

const overviewMetrics = [
  {
    detail: "74 người hoạt động hôm nay",
    icon: Users,
    label: "Người dùng hoạt động",
    value: "1,286",
  },
  {
    detail: "98,7% có nguồn",
    icon: Bot,
    label: "Câu trả lời AI hôm nay",
    value: "3,842",
  },
  {
    detail: "Thuộc 28 đơn vị",
    icon: FileText,
    label: "Tài liệu đã xuất bản",
    value: "2,418",
  },
  {
    detail: "6 yêu cầu chờ phân công",
    icon: TicketCheck,
    label: "Yêu cầu đang mở",
    value: "23",
  },
]

const services = [
  {
    latency: "142 ms",
    name: "API trò chuyện và truy xuất",
    status: "Hoạt động",
  },
  { latency: "318 ms", name: "Nạp tài liệu", status: "Hoạt động" },
  { latency: "95 ms", name: "Danh tính và truy cập", status: "Hoạt động" },
  { latency: "1 cảnh báo", name: "Gửi thông báo", status: "Suy giảm" },
]

export function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
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
          Vừa cập nhật
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <Card className="border bg-card shadow-none">
          <CardHeader className="flex-row items-center justify-between gap-4 border-b">
            <div>
              <CardTitle>Hoạt động nền tảng</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Mức sử dụng tương đối trong bảy ngày gần nhất
              </p>
            </div>
            <Badge variant="secondary">20–26/07</Badge>
          </CardHeader>
          <CardContent className="p-5 md:p-6">
            <div className="flex h-64 items-end gap-3 rounded-xl bg-[linear-gradient(to_bottom,var(--background)_0,var(--card)_100%)] p-4 md:gap-5">
              {[42, 58, 51, 76, 64, 88, 72].map((height, index) => (
                <div
                  className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
                  key={height}
                >
                  <div
                    className="min-h-4 rounded-t-lg bg-primary transition-opacity hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-center text-[10px] text-muted-foreground">
                    {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][index]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Câu hỏi" value="18,540" />
              <MiniStat label="Lượt mở nguồn" value="7,291" />
              <MiniStat label="Đánh giá hữu ích" value="91,8%" />
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-none">
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
            {services.map((service) => (
              <div
                className="flex items-center gap-3 rounded-xl border p-3"
                key={service.name}
              >
                <div
                  className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                    service.status === "Hoạt động"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {service.status === "Hoạt động" ? (
                    <CheckCircle2 aria-hidden="true" className="size-4" />
                  ) : (
                    <ShieldAlert aria-hidden="true" className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">
                    {service.name}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {service.status}
                  </p>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {service.latency}
                </span>
              </div>
            ))}
            <PermissionGate
              requiredPermissions={PERMISSION_POLICIES.adminHealth}
            >
              <Button className="mt-2 w-full" variant="outline">
                Mở trang tình trạng dịch vụ
                <ArrowRight aria-hidden="true" />
              </Button>
            </PermissionGate>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard
          description="Rà soát phân quyền và các bất thường truy cập."
          icon={Users}
          requiredPermissions={PERMISSION_POLICIES.adminUsers}
          title="Quản trị người dùng"
        />
        <ActionCard
          description="Theo dõi mức sử dụng, độ trễ và kiểm soát chi phí."
          icon={Server}
          requiredPermissions={PERMISSION_POLICIES.adminModels}
          title="Nhà cung cấp AI"
        />
        <ActionCard
          description="Kiểm tra các thay đổi cấu hình và truy cập quan trọng."
          icon={Activity}
          requiredPermissions={PERMISSION_POLICIES.adminLogs}
          title="Kiểm toán hệ thống"
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

function ActionCard({
  description,
  icon: Icon,
  requiredPermissions,
  title,
}: {
  description: string
  icon: LucideIcon
  requiredPermissions: readonly PermissionRequirement[]
  title: string
}) {
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
          <Button aria-label={`Mở ${title}`} size="icon-sm" variant="ghost">
            <ArrowRight aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    </PermissionGate>
  )
}
