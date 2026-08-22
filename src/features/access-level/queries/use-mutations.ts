import { useMutation, useQueryClient } from "@tanstack/react-query"

import { accessLevelApi } from "@/features/access-level/api/access-level-api"
import { accessLevelKeys } from "@/features/access-level/queries/keys"
import type {
  CreateAccessLevelRequest,
  UpdateAccessLevelRequest,
} from "@/features/access-level/schemas/access-level-schemas"

export function useCreateAccessLevelMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: accessLevelKeys.list(),
      successMessage: "Đã tạo cấp độ truy cập mới.",
    },
    mutationFn: (input: CreateAccessLevelRequest) =>
      accessLevelApi.createAccessLevel(input),
  })
}

type UpdateAccessLevelVariables = {
  accessLevelId: string
  input: UpdateAccessLevelRequest
}

export function useUpdateAccessLevelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: {
      invalidatesQuery: accessLevelKeys.list(),
      successMessage: "Đã cập nhật cấp độ truy cập.",
    },
    mutationFn: ({ accessLevelId, input }: UpdateAccessLevelVariables) =>
      accessLevelApi.updateAccessLevel(accessLevelId, input),
    onSuccess: (updatedAccessLevel) => {
      queryClient.setQueryData(
        accessLevelKeys.list(),
        (
          current:
            | Awaited<ReturnType<typeof accessLevelApi.getAccessLevels>>
            | undefined
        ) =>
          current?.map((accessLevel) =>
            accessLevel.id === updatedAccessLevel.id
              ? updatedAccessLevel
              : accessLevel
          )
      )
    },
  })
}

export function useDeleteAccessLevelMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: accessLevelKeys.list(),
      successMessage: "Đã xóa cấp độ truy cập.",
    },
    mutationFn: (accessLevelId: string) =>
      accessLevelApi.deleteAccessLevel(accessLevelId),
  })
}
