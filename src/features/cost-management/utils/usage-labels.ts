import type {
  UsageCostStatus,
  UsageRequestStatus,
} from "@/features/cost-management/schemas/cost-management-schemas"

const REQUEST_STATUS_LABELS = {
  SUCCESS: "Thành công",
  PARTIAL: "Một phần lỗi",
  ERROR: "Lỗi",
} as const satisfies Record<UsageRequestStatus, string>

export function getUsageRequestStatusLabel(status: UsageRequestStatus): string {
  return REQUEST_STATUS_LABELS[status]
}

export function getUsageRequestStatusBadgeClassName(
  status: UsageRequestStatus
): string {
  switch (status) {
    case "SUCCESS":
      return "border-transparent bg-success/10 text-success"
    case "PARTIAL":
      return "border-transparent bg-warning/40 text-warning-foreground"
    case "ERROR":
      return "border-transparent bg-destructive/10 text-destructive"
  }
}

const COST_STATUS_LABELS = {
  PRICED: "Đã định giá",
  UNPRICED: "Chưa định giá",
  FREE: "Miễn phí",
} as const satisfies Record<UsageCostStatus, string>

export function getUsageCostStatusLabel(status: UsageCostStatus): string {
  return COST_STATUS_LABELS[status]
}
