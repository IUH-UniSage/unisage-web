export const documentKeys = {
  all: ["document"] as const,
  detail: (id: string) => [...documentKeys.all, "detail", id] as const,
  list: (page: number, limit: number) =>
    [...documentKeys.all, "list", { limit, page }] as const,
}
