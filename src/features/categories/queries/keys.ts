export const categoryKeys = {
  all: ["category"] as const,
  list: () => [...categoryKeys.all, "list"] as const,
}
