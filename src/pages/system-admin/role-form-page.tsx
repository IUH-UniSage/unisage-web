import { useNavigate, useParams } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import { adminRoleDetailPath, ROUTES } from "@/constants/paths"
import { RoleDialog } from "@/features/rbac/components/role/role-dialog"
import { useRoleDetail } from "@/features/rbac/hooks/use-role-detail"
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "@/features/rbac/queries/use-mutations"
import { useAccessPermissionsQuery } from "@/features/rbac/queries/use-queries"
import type { CreateRoleRequest } from "@/features/rbac/schemas/rbac-schemas"

export function RoleFormPage() {
  const { roleId } = useParams<{ roleId: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(roleId)

  const { data: role, isPending } = useRoleDetail(roleId)
  const permissionsQuery = useAccessPermissionsQuery()
  const createRole = useCreateRoleMutation()
  const updateRole = useUpdateRoleMutation()

  if (isEdit && isPending) {
    return (
      <div className="space-y-6" aria-label="Đang tải vai trò">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (isEdit && !role) {
    return (
      <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
        Không tìm thấy vai trò.
      </p>
    )
  }

  const cancelPath =
    isEdit && roleId ? adminRoleDetailPath(roleId) : ROUTES.adminRbac

  const save = async (input: CreateRoleRequest) => {
    if (isEdit && roleId) {
      const updated = await updateRole.mutateAsync({ input, roleId })
      navigate(adminRoleDetailPath(updated.id))
    } else {
      const created = await createRole.mutateAsync(input)
      navigate(adminRoleDetailPath(created.id))
    }
  }

  return (
    <RoleDialog
      isSaving={createRole.isPending || updateRole.isPending}
      onOpenChange={(open) => {
        if (!open) navigate(cancelPath)
      }}
      onSubmit={save}
      permissions={permissionsQuery.data?.data ?? []}
      role={role}
    />
  )
}
