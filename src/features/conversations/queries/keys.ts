import type { MySharesParams } from "@/features/conversations/api/share-api"

export const shareKeys = {
  all: ["shares"] as const,
  mine: (params: MySharesParams) => [...shareKeys.all, "mine", params] as const,
  view: (token: string) => [...shareKeys.all, "view", token] as const,
}
