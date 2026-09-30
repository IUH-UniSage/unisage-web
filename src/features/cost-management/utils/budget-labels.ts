import type {
  BudgetAction,
  BudgetPeriod,
  BudgetScope,
} from "@/features/cost-management/schemas/cost-management-schemas"

const SCOPE_LABELS = {
  SYSTEM: "Hệ thống",
  PROVIDER: "Nhà cung cấp",
  PURPOSE: "Mục đích",
} as const satisfies Record<BudgetScope, string>

export function getBudgetScopeLabel(scope: BudgetScope): string {
  return SCOPE_LABELS[scope]
}

const PERIOD_LABELS = {
  DAILY: "Hàng ngày",
  MONTHLY: "Hàng tháng",
} as const satisfies Record<BudgetPeriod, string>

export function getBudgetPeriodLabel(period: BudgetPeriod): string {
  return PERIOD_LABELS[period]
}

const ACTION_LABELS = {
  ALERT: "Chỉ cảnh báo",
  THROTTLE: "Giới hạn đồng thời",
  BLOCK: "Từ chối request mới",
} as const satisfies Record<BudgetAction, string>

export function getBudgetActionLabel(action: BudgetAction): string {
  return ACTION_LABELS[action]
}
