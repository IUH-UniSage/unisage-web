import { KeyRound, UsersRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PermissionEditorCard } from "@/features/access-control/components/permission-editor-card"
import { RoleListCard } from "@/features/access-control/components/role-list-card"
import { useAccessControlDashboard } from "@/features/access-control/hooks/use-access-control-dashboard"

export function AccessControlDashboard() {
  const dashboard = useAccessControlDashboard()

  if (dashboard.isPending) {
    return <AccessControlSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Kiểm soát truy cập
          </p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            Vai trò & phân quyền
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Quản lý phạm vi chức năng được phép sử dụng theo từng vai trò trong
            UniSage.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="h-7 px-3" variant="secondary">
            <UsersRound aria-hidden="true" />
            {dashboard.roles.length} vai trò
          </Badge>
          <Badge className="h-7 px-3" variant="outline">
            <KeyRound aria-hidden="true" />
            {
              dashboard.permissions.filter((permission) => permission.isActive)
                .length
            }{" "}
            quyền
          </Badge>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <RoleListCard
          onSelectRole={dashboard.selectRole}
          roles={dashboard.roles}
          selectedRole={dashboard.selectedRole}
        />
        <PermissionEditorCard
          activePermissionIds={dashboard.activePermissionIds}
          canUpdateRoles={dashboard.canUpdateRoles}
          isDirty={dashboard.isDirty}
          isSaving={dashboard.isSaving}
          onPermissionSearchChange={dashboard.setPermissionSearch}
          onReset={dashboard.resetPermissions}
          onSave={dashboard.saveRole}
          onTogglePermission={dashboard.togglePermission}
          permissionGroups={dashboard.permissionGroups}
          permissionSearch={dashboard.permissionSearch}
          selectedRole={dashboard.selectedRole}
        />
      </div>
    </div>
  )
}

function AccessControlSkeleton() {
  return (
    <div className="space-y-6" aria-label="Đang tải trang phân quyền">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-[520px] max-w-full" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-[640px] rounded-xl" />
      </div>
    </div>
  )
}
