import type { SystemHealthHistoryParams } from "@/features/system-health/api/system-health-api"

export const systemHealthKeys = {
  all: ["system-health"] as const,
  history: (params: SystemHealthHistoryParams) =>
    [...systemHealthKeys.all, "history", params] as const,
  live: () => [...systemHealthKeys.all, "live"] as const,
}
