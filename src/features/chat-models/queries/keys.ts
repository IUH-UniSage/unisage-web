export const chatModelKeys = {
  all: ["chatModel"] as const,
  list: (page: number, limit: number) =>
    [...chatModelKeys.all, "list", { limit, page }] as const,
}
