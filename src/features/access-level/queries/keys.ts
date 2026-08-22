export const accessLevelKeys = {
  all: ["access-level"] as const,
  list: () => [...accessLevelKeys.all, "list"] as const,
}
