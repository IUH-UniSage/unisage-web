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

export function useRecoverDepartmentMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: departmentKeys.list(),
      successMessage: "Đã khôi phục phòng ban.",
    },
    mutationFn: (departmentId: string) =>
      departmentApi.recoverDepartment(departmentId),
  })
}
