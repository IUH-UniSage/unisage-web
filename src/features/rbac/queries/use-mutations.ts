import { useMutation, useQueryClient } from "@tanstack/react-query"

import { rbacApi } from "@/features/rbac/api/rbac-api"
import { rbacKeys } from "@/features/rbac/queries/keys"
import type {
  CreatePermissionRequest,
  CreateRoleRequest,
  UpdatePermissionRequest,
  UpdateRoleRequest,
} from "@/features/rbac/schemas/rbac-schemas"

export function useCreatePermissionMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: rbacKeys.permissions(),
      successMessage: "Đã tạo quyền hạn mới.",
    },
    mutationFn: (input: CreatePermissionRequest) =>
      rbacApi.createPermission(input),
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
      invalidatesQuery: rbacKeys.permissions(),
      successMessage: "Đã cập nhật quyền hạn.",
    },
    mutationFn: ({ input, permissionId }: UpdatePermissionVariables) =>
      rbacApi.updatePermission(permissionId, input),
    onSuccess: (updatedPermission) => {
      queryClient.setQueryData(
        rbacKeys.permissions(),
        (
          current:
            Awaited<ReturnType<typeof rbacApi.getPermissions>> | undefined
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
      invalidatesQuery: rbacKeys.permissions(),
      successMessage: "Đã vô hiệu hóa quyền hạn.",
    },
    mutationFn: (permissionId: string) =>
      rbacApi.deletePermission(permissionId),
  })
}

export function useRecoverPermissionMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: rbacKeys.permissions(),
      successMessage: "Đã khôi phục quyền hạn.",
    },
    mutationFn: (permissionId: string) =>
      rbacApi.recoverPermission(permissionId),
  })
}

export function useDeletePermissionsBulkMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: rbacKeys.permissions(),
      successMessage: "Đã vô hiệu hóa các quyền hạn đã chọn.",
    },
    mutationFn: (permissionIds: string[]) =>
      rbacApi.deletePermissionsBulk(permissionIds),
  })
}

export function useRecoverPermissionsBulkMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: rbacKeys.permissions(),
      successMessage: "Đã khôi phục các quyền hạn đã chọn.",
    },
    mutationFn: (permissionIds: string[]) =>
      rbacApi.recoverPermissionsBulk(permissionIds),
  })
}

export function useCreateRoleMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: rbacKeys.roles(),
      successMessage: "Đã tạo vai trò mới.",
    },
    mutationFn: (input: CreateRoleRequest) => rbacApi.createRole(input),
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
      invalidatesQuery: rbacKeys.roles(),
      successMessage: "Đã cập nhật vai trò.",
    },
    mutationFn: ({ input, roleId }: UpdateRoleVariables) =>
      rbacApi.updateRole(roleId, input),
    onSuccess: (updatedRole) => {
      queryClient.setQueryData(
        rbacKeys.roles(),
        (current: Awaited<ReturnType<typeof rbacApi.getRoles>> | undefined) =>
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
      invalidatesQuery: rbacKeys.roles(),
      successMessage: "Đã vô hiệu hóa vai trò.",
    },
    mutationFn: (roleId: string) => rbacApi.deleteRole(roleId),
  })
}

export function useRecoverRoleMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: rbacKeys.roles(),
      successMessage: "Đã khôi phục vai trò.",
    },
    mutationFn: (roleId: string) => rbacApi.recoverRole(roleId),
  })
}

export function useDeleteRolesBulkMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: rbacKeys.roles(),
      successMessage: "Đã vô hiệu hóa các vai trò đã chọn.",
    },
    mutationFn: (roleIds: string[]) => rbacApi.deleteRolesBulk(roleIds),
  })
}

export function useRecoverRolesBulkMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: rbacKeys.roles(),
      successMessage: "Đã khôi phục các vai trò đã chọn.",
    },
    mutationFn: (roleIds: string[]) => rbacApi.recoverRolesBulk(roleIds),
  })
}
