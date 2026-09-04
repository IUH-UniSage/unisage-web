import {
  Calendar,
  Clock,
  Pencil,
  Search,
  ShieldCheck,
  User,
} from "lucide-react"
import { useMemo, useState } from "react"

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
import { Input } from "@/components/ui/input"
import type { AccessRole } from "@/features/rbac/schemas/rbac-schemas"
import {
  getPermissionLabel,
  getResourceLabel,
  groupPermissions,
} from "@/features/rbac/utils/rbac-formatters"
import { formatAuditDate } from "@/utils/date-format"

type RoleDetailDialogProps = {
  canUpdate: boolean
  onEdit: (role: AccessRole) => void
  onOpenChange: (open: boolean) => void
  open?: boolean
  role?: AccessRole
}

export function RoleDetailDialog({
  canUpdate,
  onEdit,
  onOpenChange,
  role,
}: RoleDetailDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const groupedPermissions = useMemo(() => {
    if (!role) return []
    return groupPermissions(role.permissions, searchQuery)
  }, [role, searchQuery])

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex items-center gap-3 self-end sm:self-center">
          <Button onClick={handleBack} type="button" variant="outline">
            Quay lại
          </Button>
          {canUpdate ? (
            <Button onClick={handleEdit} type="button">
              <Pencil className="mr-2 size-4" />
              Chỉnh sửa vai trò
            </Button>
          ) : null}
        </div>
      </div>

      {/* Basic Role Metadata Card */}
      <Card className="border bg-card shadow-none">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold">
            Thông tin tổng quan
          </CardTitle>
          <CardDescription>
            Các thông số chính và thông tin kiểm toán của vai trò.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Description */}
          <div>
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Mô tả vai trò
            </span>
            <p className="mt-1.5 rounded-xl border bg-muted/40 p-3.5 text-sm leading-relaxed text-foreground">
              {role.description || "Chưa có mô tả cho vai trò này."}
            </p>
          </div>

          {/* Audit Metadata Grid */}
          <div className="grid gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <User className="size-4" />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Người tạo
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {role.createdBy || "Hệ thống"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Calendar className="size-4" />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Ngày tạo
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatAuditDate(role.createdAt)}
                </span>
              </div>
            </div>

            {role.updatedAt ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <User className="size-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-muted-foreground">
                      Người cập nhật
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {role.updatedBy || "Hệ thống"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-muted-foreground">
                      Cập nhật lần cuối
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatAuditDate(role.updatedAt)}
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Permissions List Card */}
      <Card className="border bg-card shadow-none">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  Quyền hạn được cấp
                </CardTitle>
                <Badge className="font-mono" variant="secondary">
                  {role.permissions.length} quyền
                </Badge>
              </div>
              <CardDescription className="mt-1">
                Danh sách các quyền chức năng mà vai trò này đang sở hữu.
              </CardDescription>
            </div>
            <ShieldCheck className="size-6 shrink-0 text-primary" />
          </div>

          {role.permissions.length > 0 ? (
            <div className="relative mt-4 max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh quyền trong vai trò..."
                value={searchQuery}
              />
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="pt-6">
          {role.permissions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground italic">
              Vai trò này hiện chưa được cấp quyền hạn nào.
            </p>
          ) : groupedPermissions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Không tìm thấy quyền hạn phù hợp với từ khóa tìm kiếm.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupedPermissions.map(({ items, resource }) => (
                <section
                  className="space-y-3 rounded-xl border bg-card p-4"
                  key={resource}
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                      {getResourceLabel(resource)}
                    </h3>
                    <Badge variant="outline">{items.length}</Badge>
                  </div>

                  <div className="space-y-2">
                    {items.map((permission) => (
                      <div
                        className="rounded-lg border bg-muted/40 p-2.5 transition-colors hover:bg-muted/70"
                        key={permission.id}
                      >
                        <p className="text-xs leading-tight font-semibold text-foreground">
                          {getPermissionLabel(permission)}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                          {permission.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
