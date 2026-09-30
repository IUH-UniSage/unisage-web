export const usageLimitKeys = {
  all: ["usage-limits"] as const,
  mine: () => [...usageLimitKeys.all, "mine"] as const,
  plans: () => [...usageLimitKeys.all, "plans"] as const,
  user: (userId: string) => [...usageLimitKeys.all, "user", userId] as const,
}
