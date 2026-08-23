import { useMutation } from "@tanstack/react-query"

import { chatModelApi } from "@/features/chat-models/api/chat-model-api"
import { chatModelKeys } from "@/features/chat-models/queries/keys"
import type {
  CreateChatModelRequest,
  UpdateChatModelRequest,
} from "@/features/chat-models/schemas/chat-model-schemas"

export function useCreateChatModelMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: chatModelKeys.all,
      successMessage: "Đã tạo mô hình chat mới.",
    },
    mutationFn: (input: CreateChatModelRequest) =>
      chatModelApi.createChatModel(input),
  })
}

type UpdateChatModelVariables = {
  chatModelId: string
  input: UpdateChatModelRequest
}

export function useUpdateChatModelMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: chatModelKeys.all,
      successMessage: "Đã cập nhật mô hình chat.",
    },
    mutationFn: ({ chatModelId, input }: UpdateChatModelVariables) =>
      chatModelApi.updateChatModel(chatModelId, input),
  })
}

export function useDeleteChatModelMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: chatModelKeys.all,
      successMessage: "Đã vô hiệu hóa mô hình chat.",
    },
    mutationFn: (chatModelId: string) =>
      chatModelApi.deleteChatModel(chatModelId),
  })
}

export function useRecoverChatModelMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: chatModelKeys.all,
      successMessage: "Đã khôi phục mô hình chat.",
    },
    mutationFn: (chatModelId: string) =>
      chatModelApi.recoverChatModel(chatModelId),
  })
}
