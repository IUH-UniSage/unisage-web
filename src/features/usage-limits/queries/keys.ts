export const usageLimitKeys = {
  all: ["usage-limits"] as const,
  mine: () => [...usageLimitKeys.all, "mine"] as const,
  plans: () => [...usageLimitKeys.all, "plans"] as const,
}
