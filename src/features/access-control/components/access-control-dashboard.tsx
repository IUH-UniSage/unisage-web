import { KeyRound, Plus, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PermissionDialog } from "@/features/access-control/components/permission-dialog"
import { PermissionList } from "@/features/access-control/components/permission-list"
import { PermissionStatusDialog } from "@/features/access-control/components/permission-status-dialog"
import { RoleDialog } from "@/features/access-control/components/role-dialog"
import { RoleList } from "@/features/access-control/components/role-list"
import { RoleStatusDialog } from "@/features/access-control/components/role-status-dialog"
import {
  type AccessControlTab,
  useAccessControlDashboard,
} from "@/features/access-control/hooks/use-access-control-dashboard"

export function AccessControlDashboard() {
  const dashboard = useAccessControlDashboard()

  if (dashboard.isPending) {
    return <AccessControlSkeleton />
  }

  const isRoleTab = dashboard.activeTab === "roles"

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Phân quyền
          </p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            {isRoleTab ? "Danh sách vai trò" : "Danh sách quyền hạn"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {isRoleTab
              ? "Quản lý các nhóm quyền truy cập hệ thống dành cho nhân viên và người dùng."
              : "Theo dõi các quyền chức năng mà backend cung cấp cho toàn hệ thống."}
          </p>
        </div>

        {isRoleTab && dashboard.canCreateRoles ? (
          <Button className="sm:self-end" onClick={dashboard.openCreateRole}>
            <Plus aria-hidden="true" />
            Thêm vai trò mới
          </Button>
        ) : null}
        {!isRoleTab && dashboard.canCreatePermissions ? (
          <Button
            className="sm:self-end"
            onClick={dashboard.openCreatePermission}
          >
            <Plus aria-hidden="true" />
            Thêm quyền hạn mới
          </Button>
        ) : null}
      </div>

      <Tabs
        onValueChange={(value) =>
          dashboard.setActiveTab(value as AccessControlTab)
        }
        value={dashboard.activeTab}
      >
        <TabsList
          className="w-full justify-start border-b pb-1 md:w-auto"
          variant="line"
        >
          <TabsTrigger className="flex-none px-1.5 md:px-3" value="roles">
            <ShieldCheck aria-hidden="true" />
            Cấu hình vai trò
          </TabsTrigger>
          <TabsTrigger className="flex-none px-1.5 md:px-3" value="permissions">
            <KeyRound aria-hidden="true" />
            Cấu hình quyền hạn
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-3" value="roles">
          <RoleList
            canDeleteRoles={dashboard.canDeleteRoles}
            canUpdateRoles={dashboard.canUpdateRoles}
            currentPage={dashboard.rolePage}
            isBulkUpdating={dashboard.isBulkUpdatingRoles}
            onBulkClear={dashboard.clearRoleSelection}
            onBulkDeactivate={dashboard.bulkDeactivateSelectedRoles}
            onBulkRecover={dashboard.bulkRecoverSelectedRoles}
            onEditRole={dashboard.openEditRole}
            onPageChange={dashboard.setRolePage}
            onPermissionChange={dashboard.setRolePermission}
            onResetFilters={dashboard.resetRoleFilters}
            onSearchChange={dashboard.setRoleSearch}
            onStatusChange={dashboard.setRoleStatus}
            onStatusRequest={dashboard.requestStatusChange}
            onToggleAllSelection={dashboard.toggleAllRolesOnPage}
            onToggleSelection={dashboard.toggleRoleSelection}
            permission={dashboard.rolePermission}
            permissionOptions={dashboard.rolePermissionOptions}
            roles={dashboard.pagedRoles}
            search={dashboard.roleSearch}
            selectedIds={dashboard.selectedRoleIds}
            status={dashboard.roleStatus}
            totalItems={dashboard.filteredRoleCount}
            totalPages={dashboard.roleTotalPages}
          />
        </TabsContent>

        <TabsContent className="mt-3" value="permissions">
          <PermissionList
            canDeletePermissions={dashboard.canDeletePermissions}
            canUpdatePermissions={dashboard.canUpdatePermissions}
            currentPage={dashboard.permissionPage}
            isBulkUpdating={dashboard.isBulkUpdatingPermissions}
            level={dashboard.permissionLevel}
            onBulkClear={dashboard.clearPermissionSelection}
            onBulkDeactivate={dashboard.bulkDeactivateSelectedPermissions}
            onBulkRecover={dashboard.bulkRecoverSelectedPermissions}
            onEditPermission={dashboard.openEditPermission}
            onLevelChange={dashboard.setPermissionLevel}
            onPageChange={dashboard.setPermissionPage}
            onResetFilters={dashboard.resetPermissionFilters}
            onSearchChange={dashboard.setPermissionSearch}
            onStatusChange={dashboard.setPermissionStatus}
            onStatusRequest={dashboard.requestPermissionStatusChange}
            onToggleAllSelection={dashboard.toggleAllPermissionsOnPage}
            onToggleSelection={dashboard.togglePermissionSelection}
            permissions={dashboard.pagedPermissions}
            search={dashboard.permissionSearch}
            selectedIds={dashboard.selectedPermissionIds}
            status={dashboard.permissionStatus}
            totalItems={dashboard.filteredPermissionCount}
            totalPages={dashboard.permissionTotalPages}
          />
        </TabsContent>
      </Tabs>

      {dashboard.isRoleDialogOpen ? (
        <RoleDialog
          isSaving={dashboard.isSavingRole}
          onOpenChange={(open) => {
            if (!open) dashboard.closeRoleDialog()
          }}
          onSubmit={dashboard.saveRole}
          open
          permissions={dashboard.permissions}
          role={dashboard.editingRole}
        />
      ) : null}

      {dashboard.statusRole ? (
        <RoleStatusDialog
          isSubmitting={dashboard.isUpdatingStatus}
          onConfirm={dashboard.confirmStatusChange}
          onOpenChange={(open) => {
            if (!open) dashboard.closeStatusDialog()
          }}
          role={dashboard.statusRole}
        />
      ) : null}

      {dashboard.isPermissionDialogOpen ? (
        <PermissionDialog
          isSaving={dashboard.isSavingPermission}
          onOpenChange={(open) => {
            if (!open) dashboard.closePermissionDialog()
          }}
          onSubmit={dashboard.savePermission}
          open
          permission={dashboard.editingPermission}
        />
      ) : null}

      {dashboard.statusPermission ? (
        <PermissionStatusDialog
          isSubmitting={dashboard.isUpdatingPermissionStatus}
          onConfirm={dashboard.confirmPermissionStatusChange}
          onOpenChange={(open) => {
            if (!open) dashboard.closePermissionStatusDialog()
          }}
          permission={dashboard.statusPermission}
        />
      ) : null}
    </div>
  )
}

function AccessControlSkeleton() {
  return (
    <div className="space-y-5" aria-label="Đang tải trang phân quyền">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-[620px] max-w-full" />
      </div>
      <Skeleton className="h-9 w-80 max-w-full" />
      <Skeleton className="h-[520px] rounded-xl" />
    </div>
  )
}
