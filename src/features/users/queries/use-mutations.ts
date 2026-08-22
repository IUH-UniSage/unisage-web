import { useMutation, useQueryClient } from "@tanstack/react-query"

import { userApi } from "@/features/users/api/user-api"
import { userKeys } from "@/features/users/queries/keys"
import type {
  CreateUserRequest,
  UpdateUserRequest,
} from "@/features/users/schemas/user-schemas"

export function useCreateUserMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: userKeys.list(),
      successMessage: "Đã tạo người dùng mới.",
    },
    mutationFn: (input: CreateUserRequest) => userApi.createUser(input),
  })
}

type UpdateUserVariables = {
  input: UpdateUserRequest
  userId: string
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: {
      invalidatesQuery: userKeys.list(),
      successMessage: "Đã cập nhật thông tin người dùng.",
    },
    mutationFn: ({ input, userId }: UpdateUserVariables) =>
      userApi.updateUser(userId, input),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(
        userKeys.list(),
        (current: Awaited<ReturnType<typeof userApi.getUsers>> | undefined) =>
          current
            ? {
                ...current,
                data: current.data.map((user) =>
                  user.id === updatedUser.id ? updatedUser : user
                ),
              }
            : current
      )
    },
  })
}

export function useDeleteUserMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: userKeys.list(),
      successMessage: "Đã vô hiệu hóa người dùng.",
    },
    mutationFn: (userId: string) => userApi.deleteUser(userId),
  })
}

export function useRecoverUserMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: userKeys.list(),
      successMessage: "Đã khôi phục người dùng.",
    },
    mutationFn: (userId: string) => userApi.recoverUser(userId),
  })
}

export function useDeleteUsersBulkMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: userKeys.list(),
      successMessage: "Đã vô hiệu hóa các người dùng đã chọn.",
    },
    mutationFn: (userIds: string[]) => userApi.deleteUsersBulk(userIds),
  })
}

export function useRecoverUsersBulkMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: userKeys.list(),
      successMessage: "Đã khôi phục các người dùng đã chọn.",
    },
    mutationFn: (userIds: string[]) => userApi.recoverUsersBulk(userIds),
  })
}
