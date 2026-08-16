import { useMutation, useQueryClient } from "@tanstack/react-query"

import { accessControlApi } from "@/features/access-control/api/access-control-api"
import { accessControlKeys } from "@/features/access-control/queries/keys"
import type { UpdateRoleRequest } from "@/features/access-control/schemas/access-control-schemas"

type UpdateRoleVariables = {
  input: UpdateRoleRequest
  roleId: string
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.roles(),
      successMessage: "Đã cập nhật quyền của vai trò.",
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
