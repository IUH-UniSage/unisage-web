export const documentKeys = {
  all: ["document"] as const,
  list: (page: number, limit: number) =>
    [...documentKeys.all, "list", { limit, page }] as const,
}
