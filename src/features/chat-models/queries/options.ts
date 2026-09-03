import { queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { chatModelApi } from "@/features/chat-models/api/chat-model-api"
import { chatModelKeys } from "@/features/chat-models/queries/keys"

export const chatModelOptions = {
  list: (page: number, limit: number) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      queryFn: () => chatModelApi.getChatModels(page, limit),
      queryKey: chatModelKeys.list(page, limit),
    }),
}
