export const documentKeys = {
  all: ["document"] as const,
  chunks: (id: string, page: number, limit: number) =>
    [...documentKeys.all, "chunks", id, { limit, page }] as const,
  detail: (id: string) => [...documentKeys.all, "detail", id] as const,
  list: (page: number, limit: number) =>
    [...documentKeys.all, "list", { limit, page }] as const,
  versions: (id: string) => [...documentKeys.all, "versions", id] as const,
}
