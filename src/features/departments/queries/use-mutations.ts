import { useMutation } from "@tanstack/react-query"

import { departmentApi } from "@/features/departments/api/department-api"
import { departmentKeys } from "@/features/departments/queries/keys"
import type { DepartmentRequest } from "@/features/departments/schemas/department-schemas"

export function useCreateDepartmentMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: departmentKeys.list(),
      successMessage: "Đã tạo phòng ban mới.",
    },
    mutationFn: (input: DepartmentRequest) =>
      departmentApi.createDepartment(input),
  })
}

type UpdateDepartmentVariables = {
  departmentId: string
  input: DepartmentRequest
}

export function useUpdateDepartmentMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: departmentKeys.list(),
      successMessage: "Đã cập nhật phòng ban.",
    },
    mutationFn: ({ departmentId, input }: UpdateDepartmentVariables) =>
      departmentApi.updateDepartment(departmentId, input),
  })
}

export function useDeleteDepartmentMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: departmentKeys.list(),
      successMessage: "Đã vô hiệu hóa phòng ban.",
    },
    mutationFn: (departmentId: string) =>
      departmentApi.deleteDepartment(departmentId),
  })
}

type RecoverVariables = { departmentId: string; includeChildren: boolean }
type BulkRecoverVariables = {
  departmentIds: string[]
  includeChildren: boolean
}

export function useRecoverDepartmentMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: departmentKeys.list(),
      successMessage: "Đã khôi phục phòng ban.",
    },
    mutationFn: ({ departmentId, includeChildren }: RecoverVariables) =>
      departmentApi.recoverDepartment(departmentId, includeChildren),
  })
}

export function useDeleteDepartmentsBulkMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: departmentKeys.list(),
      successMessage: "Đã vô hiệu hóa các phòng ban đã chọn.",
    },
    mutationFn: (departmentIds: string[]) =>
      departmentApi.deleteDepartmentsBulk(departmentIds),
  })
}

export function useRecoverDepartmentsBulkMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: departmentKeys.list(),
      successMessage: "Đã khôi phục các phòng ban đã chọn.",
    },
    mutationFn: ({ departmentIds, includeChildren }: BulkRecoverVariables) =>
      departmentApi.recoverDepartmentsBulk(departmentIds, includeChildren),
  })
}
