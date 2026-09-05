import { useNavigate, useParams } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import { adminUserDetailPath, ROUTES } from "@/constants/paths"
import { useAccessRolesQuery } from "@/features/rbac/queries/use-queries"
import { UserDialog } from "@/features/users/components/user-dialog"
import { useUserDetail } from "@/features/users/hooks/use-user-detail"
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/features/users/queries/use-mutations"
import type {
  CreateUserRequest,
  UpdateUserRequest,
} from "@/features/users/schemas/user-schemas"

export function UserFormPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(userId)

  const { data: user, isPending } = useUserDetail(userId)
  const rolesQuery = useAccessRolesQuery()
  const createUser = useCreateUserMutation()
  const updateUser = useUpdateUserMutation()

  if (isEdit && isPending) {
    return (
      <div className="space-y-6" aria-label="Đang tải người dùng">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (isEdit && !user) {
    return (
      <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
        Không tìm thấy người dùng.
      </p>
    )
  }

  const cancelPath =
    isEdit && userId ? adminUserDetailPath(userId) : ROUTES.adminUsers

  const save = async (input: CreateUserRequest | UpdateUserRequest) => {
    if (isEdit && userId) {
      const updated = await updateUser.mutateAsync({
        input: input as UpdateUserRequest,
        userId,
      })
      navigate(adminUserDetailPath(updated.id))
    } else {
      await createUser.mutateAsync(input as CreateUserRequest)
      navigate(ROUTES.adminUsers)
    }
  }

  return (
    <UserDialog
      isSaving={createUser.isPending || updateUser.isPending}
      onOpenChange={(open) => {
        if (!open) navigate(cancelPath)
      }}
      onSubmit={save}
      roles={rolesQuery.data?.data ?? []}
      user={user}
    />
  )
}
