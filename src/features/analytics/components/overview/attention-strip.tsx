import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  FileWarning,
  RefreshCcw,
  TicketCheck,
} from "lucide-react"
import { Link } from "react-router-dom"

import { ROUTES } from "@/constants/paths"
import type { Attention } from "@/features/analytics/schemas/dashboard-schemas"
import { formatCount } from "@/features/analytics/utils/dashboard-format"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSION_POLICIES } from "@/features/auth/utils/permission-policies"
import { cn } from "@/lib/utils"
import type { PermissionRequirement } from "@/utils/permissions"

type AttentionItem = {
  description: string
  icon: LucideIcon
  key: string
  requiredPermissions: readonly PermissionRequirement[]
  title: string
  to: string
  tone: "critical" | "warning" | "info"
}

const TONE_CLASSNAME: Record<AttentionItem["tone"], string> = {
  critical: "border-destructive/40 bg-destructive/5 [&_svg]:text-destructive",
  info: "bg-card [&_svg]:text-primary",
  warning:
    "border-warning-foreground/25 bg-warning/40 [&_svg]:text-warning-foreground",
}

function buildItems(attention: Attention): AttentionItem[] {
  const items: AttentionItem[] = []
  if (attention.activeBudgetAlerts > 0) {
    items.push({
      description: "Chi phí AI đã chạm ngưỡng cảnh báo ngân sách.",
      icon: CircleAlert,
      key: "budget-alerts",
      requiredPermissions: PERMISSION_POLICIES.costManagement,
      title: `${formatCount(attention.activeBudgetAlerts)} cảnh báo ngân sách`,
      to: `${ROUTES.adminCostManagement}?tab=alerts`,
      tone: "critical",
    })
  }
  if (attention.failedDocuments > 0) {
    items.push({
      description: "Chưa được đưa vào kho tri thức, cần xử lý lại.",
      icon: FileWarning,
      key: "failed-documents",
      requiredPermissions: PERMISSION_POLICIES.documents,
      title: `${formatCount(attention.failedDocuments)} tài liệu xử lý thất bại`,
      to: ROUTES.adminDocuments,
      tone: "warning",
    })
  }
  if (attention.outdatedDocuments > 0) {
    items.push({
      description:
        "Đã thay file mới nhưng chưa nạp lại, nên chưa tìm kiếm được.",
      icon: RefreshCcw,
      key: "outdated-documents",
      requiredPermissions: PERMISSION_POLICIES.documents,
      title: `${formatCount(attention.outdatedDocuments)} tài liệu cần nạp lại`,
      to: ROUTES.adminDocuments,
      tone: "warning",
    })
  }
  if (attention.openTickets > 0) {
    items.push({
      description: "Người dùng đang chờ phản hồi.",
      icon: TicketCheck,
      key: "open-tickets",
      requiredPermissions: PERMISSION_POLICIES.adminTickets,
      title: `${formatCount(attention.openTickets)} yêu cầu hỗ trợ đang mở`,
      to: ROUTES.adminTickets,
      tone: "info",
    })
  }
  return items
}

export function AttentionStrip({ attention }: { attention: Attention }) {
  const { canAny } = usePermissions()
  const items = buildItems(attention).filter((item) =>
    canAny(item.requiredPermissions)
  )

  if (items.length === 0) {
    return (
      <section
        aria-label="Cần xử lý"
        className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground"
      >
        <CircleCheck aria-hidden="true" className="size-4 text-success" />
        Không có việc gì cần xử lý ngay.
      </section>
    )
  }

  return (
    <section aria-labelledby="dashboard-attention-title" className="space-y-3">
      <h2 className="text-sm font-semibold" id="dashboard-attention-title">
        Cần xử lý ({items.length})
        <span className="font-normal text-muted-foreground">
          {" "}
          · tình trạng hiện tại
        </span>
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              className={cn(
                "group flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                TONE_CLASSNAME[item.tone]
              )}
              key={item.key}
              to={item.to}
            >
              <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <ArrowRight
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground! transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
