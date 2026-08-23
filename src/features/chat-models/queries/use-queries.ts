import { useQuery } from "@tanstack/react-query"

import { chatModelOptions } from "@/features/chat-models/queries/options"

export function useChatModelsQuery(page: number, limit: number) {
  return useQuery(chatModelOptions.list(page, limit))
}
