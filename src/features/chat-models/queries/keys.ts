import type { ChatModelsParams } from "@/features/chat-models/api/chat-model-api"

export const chatModelKeys = {
  all: ["chatModel"] as const,
  list: (params: ChatModelsParams) =>
    [...chatModelKeys.all, "list", params] as const,
}

export const verificationJobKeys = {
  all: ["verificationJob"] as const,
  detail: (jobId: string) =>
    [...verificationJobKeys.all, "detail", jobId] as const,
  list: (
    page: number,
    limit: number,
    filters?: { chatModelId?: string; status?: string }
  ) => [...verificationJobKeys.all, "list", { filters, limit, page }] as const,
}
