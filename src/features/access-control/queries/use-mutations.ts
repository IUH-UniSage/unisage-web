import { useMutation, useQueryClient } from "@tanstack/react-query"

import { accessControlApi } from "@/features/access-control/api/access-control-api"
import { accessControlKeys } from "@/features/access-control/queries/keys"
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/features/access-control/schemas/access-control-schemas"

export function useCreateRoleMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.roles(),
      successMessage: "Đã tạo vai trò mới.",
    },
    mutationFn: (input: CreateRoleRequest) =>
      accessControlApi.createRole(input),
  })
}

type UpdateRoleVariables = {
  input: UpdateRoleRequest
  roleId: string
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.roles(),
      successMessage: "Đã cập nhật vai trò.",
    },
    mutationFn: ({ input, roleId }: UpdateRoleVariables) =>
      accessControlApi.updateRole(roleId, input),
    onSuccess: (updatedRole) => {
      queryClient.setQueryData(
        accessControlKeys.roles(),
        (
          current:
            Awaited<ReturnType<typeof accessControlApi.getRoles>> | undefined
        ) =>
          current
            ? {
                ...current,
                data: current.data.map((role) =>
                  role.id === updatedRole.id ? updatedRole : role
                ),
              }
            : current
      )
    },
  })
}

export function useDeleteRoleMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.roles(),
      successMessage: "Đã vô hiệu hóa vai trò.",
    },
    mutationFn: (roleId: string) => accessControlApi.deleteRole(roleId),
  })
}

export function useRecoverRoleMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.roles(),
      successMessage: "Đã khôi phục vai trò.",
    },
    mutationFn: (roleId: string) => accessControlApi.recoverRole(roleId),
  })
}
