import type { DashboardPeriod } from "@/features/analytics/schemas/dashboard-schemas"

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (period: DashboardPeriod) =>
    [...dashboardKeys.all, "summary", period] as const,
}
