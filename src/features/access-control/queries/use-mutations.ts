import { useMutation, useQueryClient } from "@tanstack/react-query"

import { accessControlApi } from "@/features/access-control/api/access-control-api"
import { accessControlKeys } from "@/features/access-control/queries/keys"
import type {
  CreatePermissionRequest,
  CreateRoleRequest,
  UpdatePermissionRequest,
  UpdateRoleRequest,
} from "@/features/access-control/schemas/access-control-schemas"

export function useCreatePermissionMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.permissions(),
      successMessage: "Đã tạo quyền hạn mới.",
    },
    mutationFn: (input: CreatePermissionRequest) =>
      accessControlApi.createPermission(input),
  })
}

type UpdatePermissionVariables = {
  input: UpdatePermissionRequest
  permissionId: string
}

export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.permissions(),
      successMessage: "Đã cập nhật quyền hạn.",
    },
    mutationFn: ({ input, permissionId }: UpdatePermissionVariables) =>
      accessControlApi.updatePermission(permissionId, input),
    onSuccess: (updatedPermission) => {
      queryClient.setQueryData(
        accessControlKeys.permissions(),
        (
          current:
            | Awaited<ReturnType<typeof accessControlApi.getPermissions>>
            | undefined
        ) =>
          current
            ? {
                ...current,
                data: current.data.map((permission) =>
                  permission.id === updatedPermission.id
                    ? updatedPermission
                    : permission
                ),
              }
            : current
      )
    },
  })
}

export function useDeletePermissionMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.permissions(),
      successMessage: "Đã vô hiệu hóa quyền hạn.",
    },
    mutationFn: (permissionId: string) =>
      accessControlApi.deletePermission(permissionId),
  })
}

export function useRecoverPermissionMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.permissions(),
      successMessage: "Đã khôi phục quyền hạn.",
    },
    mutationFn: (permissionId: string) =>
      accessControlApi.recoverPermission(permissionId),
  })
}

export function useDeletePermissionsBulkMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.permissions(),
      successMessage: "Đã vô hiệu hóa các quyền hạn đã chọn.",
    },
    mutationFn: (permissionIds: string[]) =>
      accessControlApi.deletePermissionsBulk(permissionIds),
  })
}

export function useRecoverPermissionsBulkMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.permissions(),
      successMessage: "Đã khôi phục các quyền hạn đã chọn.",
    },
    mutationFn: (permissionIds: string[]) =>
      accessControlApi.recoverPermissionsBulk(permissionIds),
  })
}

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

export function useDeleteRolesBulkMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.roles(),
      successMessage: "Đã vô hiệu hóa các vai trò đã chọn.",
    },
    mutationFn: (roleIds: string[]) =>
      accessControlApi.deleteRolesBulk(roleIds),
  })
}

export function useRecoverRolesBulkMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: accessControlKeys.roles(),
      successMessage: "Đã khôi phục các vai trò đã chọn.",
    },
    mutationFn: (roleIds: string[]) =>
      accessControlApi.recoverRolesBulk(roleIds),
  })
}
