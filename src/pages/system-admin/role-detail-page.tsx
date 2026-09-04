import { useNavigate, useParams } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import { adminRoleEditPath, ROUTES } from "@/constants/paths"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { RoleDetailDialog } from "@/features/rbac/components/role/role-detail-dialog"
import { useRoleDetail } from "@/features/rbac/hooks/use-role-detail"
import { PERMISSIONS } from "@/utils/permissions"

export function RoleDetailPage() {
  const { roleId } = useParams<{ roleId: string }>()
  const navigate = useNavigate()
  const { can } = usePermissions()
  const { data: role, isPending } = useRoleDetail(roleId)

  if (isPending) {
    return (
      <div className="space-y-6" aria-label="Đang tải chi tiết vai trò">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!role) {
    return (
      <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
        Không tìm thấy vai trò.
      </p>
    )
  }

  return (
    <RoleDetailDialog
      canUpdate={can(PERMISSIONS.roleUpdate)}
      onEdit={() => navigate(adminRoleEditPath(role.id))}
      onOpenChange={(open) => {
        if (!open) navigate(ROUTES.adminRbac)
      }}
      role={role}
    />
  )
}
