import type { UsageLimitPlan } from "@/features/usage-limits/schemas/usage-limit-schemas"

export type PlanKind = "default" | "limited" | "unlimited"
export type PlanKindFilter = PlanKind | "all"

export const PLAN_KIND_LABELS = {
  default: "Mặc định",
  limited: "Có giới hạn",
  unlimited: "Không giới hạn",
} as const satisfies Record<PlanKind, string>

const PLAN_KIND_BADGE_CLASSNAME = {
  default: "border-transparent bg-success/10 text-success",
  limited: "border-transparent bg-muted text-muted-foreground",
  unlimited: "border-transparent bg-sky/10 text-sky",
} as const satisfies Record<PlanKind, string>

export function isUnlimitedPlan(plan: UsageLimitPlan) {
  return plan.dailyTokenLimit == null && plan.weeklyTokenLimit == null
}

// The default plan is shown as such even when it also happens to be unlimited.
export function getPlanKind(plan: UsageLimitPlan): PlanKind {
  if (plan.isDefault) return "default"
  return isUnlimitedPlan(plan) ? "unlimited" : "limited"
}

export function getPlanKindBadgeClassName(kind: PlanKind) {
  return PLAN_KIND_BADGE_CLASSNAME[kind]
}

// Filters by what a plan does, so "Không giới hạn" also finds an unlimited default plan.
export function matchesPlanKind(plan: UsageLimitPlan, filter: PlanKindFilter) {
  switch (filter) {
    case "all":
      return true
    case "default":
      return plan.isDefault
    case "unlimited":
      return isUnlimitedPlan(plan)
    case "limited":
      return !isUnlimitedPlan(plan)
  }
}
