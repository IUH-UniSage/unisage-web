export const systemConfigKeys = {
  all: ["system-configs"] as const,
  list: () => [...systemConfigKeys.all, "list"] as const,
}
