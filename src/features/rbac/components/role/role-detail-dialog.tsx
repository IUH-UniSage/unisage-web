import { ArrowLeft, Pencil, ShieldCheck } from "lucide-react"
import { useMemo, useState } from "react"

import { AuditInfo } from "@/components/shared/audit-info"
import { EntityStatusBadge } from "@/components/shared/list/entity-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PermissionMatrix } from "@/features/rbac/components/permission/permission-matrix"
import type {
  AccessPermission,
  AccessRole,
} from "@/features/rbac/schemas/rbac-schemas"
import { buildPermissionMatrix } from "@/features/rbac/utils/permission-matrix"
import { expandImpliedPermissionIds } from "@/features/rbac/utils/rbac-formatters"

type RoleDetailDialogProps = {
  canUpdate: boolean
  onEdit: (role: AccessRole) => void
  onOpenChange: (open: boolean) => void
  open?: boolean
  permissions: AccessPermission[]
  role?: AccessRole
}

export function RoleDetailDialog({
  canUpdate,
  onEdit,
  onOpenChange,
  permissions,
  role,
}: RoleDetailDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const ownedPermissionIds = useMemo(
    () =>
      new Set(
        expandImpliedPermissionIds(
          role?.permissions.map((permission) => permission.id) ?? [],
          permissions
        )
      ),
    [permissions, role]
  )

  const matrixRows = useMemo(
    () => buildPermissionMatrix(permissions, searchQuery),
    [permissions, searchQuery]
  )

  if (!role) return null

  const handleBack = () => {
    onOpenChange(false)
  }

  const handleEdit = () => {
    onOpenChange(false)
    onEdit(role)
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            aria-label="Quay lại danh sách vai trò"
            className="mt-0.5 shrink-0"
            onClick={handleBack}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
              Quản trị · Phân quyền
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold md:text-3xl">{role.name}</h1>
              <EntityStatusBadge isActive={role.isActive} />
              <Badge variant={role.isSystemRole ? "default" : "outline"}>
                {role.isSystemRole ? "Vai trò hệ thống" : "Vai trò tùy chỉnh"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Xem chi tiết thông tin cấu hình và các quyền hạn được gán cho vai
              trò này.
            </p>
          </div>
        </div>

        {canUpdate ? (
          <Button
            className="self-end sm:self-start"
            onClick={handleEdit}
            type="button"
          >
            <Pencil className="mr-2 size-4" />
            Chỉnh sửa vai trò
          </Button>
        ) : null}
      </div>

      {/* Basic Role Metadata Card */}
      <Card className="border bg-card shadow-none">
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold">
            Thông tin tổng quan
          </CardTitle>
          <CardDescription>Các thông số chính của vai trò.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Mô tả vai trò
            </span>
            <p className="mt-1.5 rounded-xl border bg-muted/40 p-3.5 text-sm leading-relaxed text-foreground">
              {role.description || "Chưa có mô tả cho vai trò này."}
            </p>
          </div>

          {/* Usage limit plan */}
          <div>
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Gói hạn mức
            </span>
            <p className="mt-1.5 rounded-xl border bg-muted/40 p-3.5 text-sm leading-relaxed text-foreground">
              {role.usageLimitPlan?.name ?? "Dùng gói mặc định"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Permissions List Card */}
      <Card className="border bg-card shadow-none">
        <CardHeader className="border-b">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Quyền hạn được cấp
              </CardTitle>
              <Badge className="font-mono" variant="secondary">
                {ownedPermissionIds.size} / {permissions.length} quyền
              </Badge>
            </div>
            <CardDescription className="mt-1">
              Toàn bộ danh mục quyền trong hệ thống — quyền đã được cấp cho vai
              trò này hiển thị ở trạng thái đã chọn.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {permissions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground italic">
              Hệ thống hiện chưa có quyền hạn nào.
            </p>
          ) : (
            <PermissionMatrix
              isChecked={(id) => ownedPermissionIds.has(id)}
              onSearchQueryChange={setSearchQuery}
              rows={matrixRows}
              searchPlaceholder="Tìm nhanh quyền hạn..."
              searchQuery={searchQuery}
            />
          )}
        </CardContent>
      </Card>

      <AuditInfo
        createdAt={role.createdAt}
        createdByName={role.createdByName}
        updatedAt={role.updatedAt}
        updatedByName={role.updatedByName}
      />
    </div>
  )
}
