import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { chatKeys } from "@/features/chat/queries/keys"
import { shareApi } from "@/features/conversations/api/share-api"
import { shareKeys } from "@/features/conversations/queries/keys"
import type { CreateShareRequest } from "@/features/conversations/schemas/share-schemas"
import { getShareErrorMessage } from "@/features/conversations/utils/share-errors"

// Every sharing mutation suppresses the global toast (it shows the backend's
// own message) and maps the error code to Vietnamese instead (spec R12).
function toastShareError(error: unknown) {
  toast.error(getShareErrorMessage(error))
}

export function useCreateShareMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: shareKeys.all,
      suppressGlobalError: true,
    },
    mutationFn: (input: CreateShareRequest) => shareApi.createShare(input),
    onError: toastShareError,
  })
}

export function useRevokeShareMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: shareKeys.all,
      successMessage: "Đã thu hồi liên kết.",
      suppressGlobalError: true,
    },
    mutationFn: (shareId: string) => shareApi.revokeShare(shareId),
    onError: toastShareError,
  })
}

export function useRevokeAllSharesMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: shareKeys.all,
      successMessage: "Đã thu hồi tất cả liên kết.",
      suppressGlobalError: true,
    },
    mutationFn: () => shareApi.revokeAllShares(),
    onError: toastShareError,
  })
}

/** "Tiếp tục cuộc trò chuyện": the copy shows up in the chat sidebar right away. */
export function useContinueShareMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: [...chatKeys.all, "conversations"],
      suppressGlobalError: true,
    },
    mutationFn: (token: string) => shareApi.continueShare(token),
    onError: toastShareError,
  })
}
