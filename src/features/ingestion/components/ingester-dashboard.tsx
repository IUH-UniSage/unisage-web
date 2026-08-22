import type { LucideIcon } from "lucide-react"
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  Files,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  TriangleAlert,
  UploadCloud,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { PermissionGate } from "@/features/auth/components/permission-gate"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"

type Metric = {
  change: string
  icon: LucideIcon
  label: string
  tone: string
  value: string
}

const metrics: Metric[] = [
  {
    change: "+18 trong tuần này",
    icon: Files,
    label: "Tổng tài liệu",
    tone: "bg-secondary text-primary",
    value: "2,418",
  },
  {
    change: "12 tác vụ đang chạy",
    icon: RefreshCcw,
    label: "Đang xử lý",
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    value: "34",
  },
  {
    change: "Tỷ lệ đạt 98,4%",
    icon: CheckCircle2,
    label: "Sẵn sàng xuất bản",
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    value: "126",
  },
  {
    change: "Cần kiểm tra",
    icon: TriangleAlert,
    label: "Tác vụ thất bại",
    tone: "bg-destructive/15 text-destructive",
    value: "7",
  },
]

const queue = [
  {
    name: "Quy-che-dao-tao-2025.pdf",
    owner: "Phòng Đào tạo",
    progress: 82,
    stage: "Đang tạo embedding",
    status: "Đang xử lý",
  },
  {
    name: "So-tay-sinh-vien-CNTT-v3.pdf",
    owner: "Khoa Công nghệ thông tin",
    progress: 48,
    stage: "Đang trích xuất metadata",
    status: "Đang xử lý",
  },
  {
    name: "Chinh-sach-hoc-phi-Q3-2026.docx",
    owner: "Phòng Tài chính",
    progress: 100,
    stage: "Đã kiểm tra chất lượng",
    status: "Sẵn sàng",
  },
  {
    name: "Huong-dan-truy-cap-thu-vien.pdf",
    owner: "Thư viện",
    progress: 16,
    stage: "Đang phân tích tài liệu",
    status: "Đang chờ",
  },
]

export function IngesterDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Vận hành tri thức
          </p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            Tổng quan nạp tài liệu
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Theo dõi tài liệu đầu vào, chất lượng trích xuất và mức độ sẵn sàng
            xuất bản.
          </p>
        </div>
        <PermissionGate
          requiredPermissions={PERMISSION_POLICIES.uploadDocument}
        >
          <Button>
            <Plus aria-hidden="true" />
            Tải tài liệu mới
          </Button>
        </PermissionGate>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <Card className="border bg-card shadow-none" key={metric.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {metric.value}
                    </p>
                  </div>
                  <div
                    className={`grid size-10 place-items-center rounded-xl ${metric.tone}`}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.7fr)]">
        <Card className="border bg-card shadow-none">
          <CardHeader className="flex-row items-center justify-between gap-4 border-b">
            <div>
              <CardTitle>Hàng đợi xử lý tài liệu</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Các tác vụ tài liệu mới nhất từ các đơn vị
              </p>
            </div>
            <PermissionGate
              requiredPermissions={PERMISSION_POLICIES.ingesterProcessing}
            >
              <Button size="sm" variant="outline">
                Xem hàng đợi
                <ArrowUpRight aria-hidden="true" />
              </Button>
            </PermissionGate>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {queue.map((job) => (
                <div
                  className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_170px_96px] md:items-center md:px-5"
                  key={job.name}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                      <FileSearch aria-hidden="true" className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {job.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {job.owner} · {job.stage}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
                      <span>Tiến độ</span>
                      <span>{job.progress}%</span>
                    </div>
                    <ProgressBar value={job.progress} />
                  </div>
                  <Badge
                    className="w-fit"
                    variant={
                      job.status === "Sẵn sàng" ? "default" : "secondary"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 bg-[#153898] text-white shadow-none dark:bg-[#173f9e]">
            <CardContent className="p-6">
              <UploadCloud aria-hidden="true" className="size-7 text-info" />
              <p className="mt-8 text-3xl font-bold text-white">92%</p>
              <p className="mt-1 text-sm font-medium text-white">
                Mục tiêu xử lý hằng tuần
              </p>
              <p className="mt-2 text-xs leading-5 text-white/65">
                Đã hoàn thành 184/200 tài liệu dự kiến trong tuần này.
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-[92%] rounded-full bg-knowledge" />
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card shadow-none">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Hoạt động gần đây</CardTitle>
              <Button
                aria-label="Tùy chọn hoạt động"
                size="icon-sm"
                variant="ghost"
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <Activity
                icon={CheckCircle2}
                text="12 tài liệu đã vượt qua kiểm tra chất lượng"
                time="18 phút trước"
              />
              <Activity
                icon={RefreshCcw}
                text="Tác vụ mô hình embedding đã khởi động lại"
                time="42 phút trước"
              />
              <Activity
                icon={Clock3}
                text="Lô tài liệu Phòng Tài chính đã vào hàng đợi"
                time="1 giờ trước"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Activity({
  icon: Icon,
  text,
  time,
}: {
  icon: LucideIcon
  text: string
  time: string
}) {
  return (
    <div className="flex gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-primary">
        <Icon aria-hidden="true" className="size-4" />
      </div>
      <div>
        <p className="text-xs leading-5 font-medium">{text}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}
