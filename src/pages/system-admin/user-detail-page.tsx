import { useNavigate, useParams } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import { adminUserEditPath, ROUTES } from "@/constants/paths"
import { UserDetailDialog } from "@/features/users/components/user-detail-dialog"
import { useUserDetail } from "@/features/users/hooks/use-user-detail"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { canUpdate } = useResourcePermissions("user")
  const { data: user, isPending } = useUserDetail(userId)

  if (isPending) {
    return (
      <div className="space-y-6" aria-label="Đang tải chi tiết người dùng">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
        Không tìm thấy người dùng.
      </p>
    )
  }

  return (
    <UserDetailDialog
      canUpdate={canUpdate}
      onEdit={() => navigate(adminUserEditPath(user.id))}
      onOpenChange={(open) => {
        if (!open) navigate(ROUTES.adminUsers)
      }}
      user={user}
    />
  )
}
