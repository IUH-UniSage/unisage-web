import { KeyRound, Plus, ShieldCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { BulkStatusDialog } from "@/components/shared/dialog/bulk-status-dialog"
import { TabbedListPage } from "@/components/shared/page/tabbed-list-page"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  adminRoleDetailPath,
  adminRoleEditPath,
  adminRoleNewPath,
} from "@/constants/paths"
import { PermissionDetailDialog } from "@/features/rbac/components/permission/permission-detail-dialog"
import { PermissionDialog } from "@/features/rbac/components/permission/permission-dialog"
import { PermissionList } from "@/features/rbac/components/permission/permission-list"
import { PermissionStatusDialog } from "@/features/rbac/components/permission/permission-status-dialog"
import { RoleList } from "@/features/rbac/components/role/role-list"
import { RoleStatusDialog } from "@/features/rbac/components/role/role-status-dialog"
import {
  type RbacTab,
  useRbacDashboard,
} from "@/features/rbac/hooks/use-rbac-dashboard"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"

export function RbacDashboard() {
  const dashboard = useRbacDashboard()
  const navigate = useNavigate()

  if (dashboard.isPending) {
    return <RbacSkeleton />
  }

  const isRoleTab = dashboard.activeTab === "roles"

  return (
    <>
      <TabbedListPage
        actions={
          isRoleTab && dashboard.canCreateRoles ? (
            <Button
              {...tourAnchor(TOUR_ANCHORS.pageActions)}
              className="sm:self-end"
              onClick={() => navigate(adminRoleNewPath())}
            >
              <Plus aria-hidden="true" />
              Thêm vai trò mới
            </Button>
          ) : !isRoleTab && dashboard.canCreatePermissions ? (
            <Button
              {...tourAnchor(TOUR_ANCHORS.pageActions)}
              className="sm:self-end"
              onClick={dashboard.openCreatePermission}
            >
              <Plus aria-hidden="true" />
              Thêm quyền hạn mới
            </Button>
          ) : undefined
        }
        description={
          isRoleTab
            ? "Quản lý các nhóm quyền truy cập hệ thống dành cho nhân viên và người dùng."
            : "Theo dõi các quyền chức năng mà backend cung cấp cho toàn hệ thống."
        }
        kicker="Quản trị · Phân quyền"
        onTabChange={(value) => dashboard.setActiveTab(value as RbacTab)}
        tabs={[
          {
            content: (
              <RoleList
                canDeleteRoles={dashboard.canDeleteRoles}
                canUpdateRoles={dashboard.canUpdateRoles}
                currentPage={dashboard.rolePage}
                isBulkUpdating={dashboard.isBulkUpdatingRoles}
                isFiltered={dashboard.isRoleFiltersApplied}
                onApplyFilters={dashboard.applyRoleFilters}
                onBulkClear={dashboard.clearRoleSelection}
                onBulkDeactivate={() =>
                  dashboard.requestRoleBulkAction("deactivate")
                }
                onBulkRecover={() => dashboard.requestRoleBulkAction("recover")}
                onDetail={(role) => navigate(adminRoleDetailPath(role.id))}
                onEditRole={(role) => navigate(adminRoleEditPath(role.id))}
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
            ),
            icon: <ShieldCheck aria-hidden="true" />,
            label: "Cấu hình vai trò",
            value: "roles",
          },
          {
            content: (
              <PermissionList
                canDeletePermissions={dashboard.canDeletePermissions}
                canUpdatePermissions={dashboard.canUpdatePermissions}
                currentPage={dashboard.permissionPage}
                isBulkUpdating={dashboard.isBulkUpdatingPermissions}
                isFiltered={dashboard.isPermissionFiltersApplied}
                onApplyFilters={dashboard.applyPermissionFilters}
                onBulkClear={dashboard.clearPermissionSelection}
                onBulkDeactivate={() =>
                  dashboard.requestPermissionBulkAction("deactivate")
                }
                onBulkRecover={() =>
                  dashboard.requestPermissionBulkAction("recover")
                }
                onDetail={dashboard.openPermissionDetail}
                onEditPermission={dashboard.openEditPermission}
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
            ),
            icon: <KeyRound aria-hidden="true" />,
            label: "Cấu hình quyền hạn",
            value: "permissions",
          },
        ]}
        title={isRoleTab ? "Danh sách vai trò" : "Danh sách quyền hạn"}
        value={dashboard.activeTab}
      />

      {dashboard.viewingPermission ? (
        <PermissionDetailDialog
          canUpdate={dashboard.canUpdatePermissions}
          onEdit={dashboard.openEditPermission}
          onOpenChange={(open) => {
            if (!open) dashboard.closePermissionDetail()
          }}
          open
          permission={dashboard.viewingPermission}
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

      {dashboard.pendingRoleBulkAction ? (
        <BulkStatusDialog
          action={dashboard.pendingRoleBulkAction}
          assignedToNoun="tài khoản"
          count={dashboard.pendingRoleBulkCount}
          entityNoun="vai trò"
          isSubmitting={dashboard.isBulkUpdatingRoles}
          onConfirm={dashboard.confirmRoleBulkAction}
          onOpenChange={(open) => {
            if (!open) dashboard.closeRoleBulkActionDialog()
          }}
        />
      ) : null}

      {dashboard.pendingPermissionBulkAction ? (
        <BulkStatusDialog
          action={dashboard.pendingPermissionBulkAction}
          assignedToNoun="vai trò"
          count={dashboard.pendingPermissionBulkCount}
          entityNoun="quyền hạn"
          isSubmitting={dashboard.isBulkUpdatingPermissions}
          onConfirm={dashboard.confirmPermissionBulkAction}
          onOpenChange={(open) => {
            if (!open) dashboard.closePermissionBulkActionDialog()
          }}
        />
      ) : null}
    </>
  )
}

function RbacSkeleton() {
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
