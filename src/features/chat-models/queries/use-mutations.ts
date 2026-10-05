import { useMutation } from "@tanstack/react-query"

import { chatModelApi } from "@/features/chat-models/api/chat-model-api"
import {
  chatModelKeys,
  verificationJobKeys,
} from "@/features/chat-models/queries/keys"
import type {
  ChatModelStatus,
  CreateChatModelRequest,
  UpdateChatModelRequest,
} from "@/features/chat-models/schemas/chat-model-schemas"

// Creating, editing (a credential change) and re-verifying a model each queue
// a verification job, so the Jobs tab has to refetch too.
const MODEL_AND_JOB_QUERIES = [chatModelKeys.all, verificationJobKeys.all]

export function useCreateChatModelMutation() {
  return useMutation({
    meta: {
      invalidatesQueries: MODEL_AND_JOB_QUERIES,
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
      invalidatesQueries: MODEL_AND_JOB_QUERIES,
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

type UpdateChatModelStatusVariables = {
  chatModelId: string
  status: ChatModelStatus
}

// Covers both activate and deactivate - the backend only ever accepts
// ACTIVE/INACTIVE here (see chatModelStatusRequestSchema); a rejected
// activate (e.g. EMBEDDING_REINDEX_REQUIRED, EMBEDDING_ACTIVE_CONFLICT) still
// invalidates the list on settle, so the row refetches its real state.
export function useUpdateChatModelStatusMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: chatModelKeys.all,
      successMessage: "Đã cập nhật trạng thái mô hình chat.",
    },
    mutationFn: ({ chatModelId, status }: UpdateChatModelStatusVariables) =>
      chatModelApi.updateChatModelStatus(chatModelId, status),
  })
}

export function useVerifyChatModelMutation() {
  return useMutation({
    meta: {
      invalidatesQueries: MODEL_AND_JOB_QUERIES,
      successMessage: "Đã tạo yêu cầu xác minh mới.",
    },
    mutationFn: (chatModelId: string) =>
      chatModelApi.verifyChatModel(chatModelId),
  })
}
