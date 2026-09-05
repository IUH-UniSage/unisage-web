import {
  Building,
  Calendar,
  Clock3,
  CreditCard,
  Mail,
  Pencil,
  Phone,
  Shield,
  ShieldAlert,
  User,
} from "lucide-react"

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
import type { AppUser } from "@/features/users/schemas/user-schemas"
import { formatAuditDate } from "@/utils/date-format"

function userDisplayName(user: AppUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "—"
}

type UserDetailDialogProps = {
  canUpdate: boolean
  onEdit: (user: AppUser) => void
  onOpenChange: (open: boolean) => void
  open?: boolean
  user?: AppUser
}

export function UserDetailDialog({
  canUpdate,
  onEdit,
  onOpenChange,
  user,
}: UserDetailDialogProps) {
  if (!user) return null

  const isActive = user.status === "ACTIVE"
  const departmentAccesses = user.departmentAccesses ?? []

  const handleBack = () => {
    onOpenChange(false)
  }

  const handleEdit = () => {
    onOpenChange(false)
    onEdit(user)
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Người dùng
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold md:text-3xl">
              {userDisplayName(user)}
            </h1>
            <EntityStatusBadge isActive={isActive} />
            {user.roleName ? (
              <Badge variant="outline">{user.roleName}</Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem chi tiết thông tin hồ sơ tài khoản và quyền truy cập phòng ban.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <Button onClick={handleBack} type="button" variant="outline">
            Quay lại
          </Button>
          {canUpdate ? (
            <Button onClick={handleEdit} type="button">
              <Pencil className="mr-2 size-4" />
              Chỉnh sửa người dùng
            </Button>
          ) : null}
        </div>
      </div>

      {/* Main Profile & Contact Card */}
      <Card className="border bg-card shadow-none">
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold">
            Thông tin tài khoản & danh tính
          </CardTitle>
          <CardDescription>
            Chi tiết hồ sơ cá nhân và các phương thức liên lạc chính.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Mail className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Email đăng nhập
                </span>
                <span className="block truncate text-sm font-semibold text-foreground">
                  {user.email || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Phone className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Số điện thoại
                </span>
                <span className="block text-sm font-semibold text-foreground">
                  {user.phone || "Chưa cập nhật"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <CreditCard className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Mã GV/SV (Định danh)
                </span>
                <span className="block font-mono text-sm font-semibold text-foreground">
                  {user.code || "Chưa có"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Shield className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Vai trò hệ thống
                </span>
                <span className="block text-sm font-semibold text-foreground">
                  {user.roleName || "Chưa gán vai trò"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <ShieldAlert className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Cấp độ truy cập mặc định
                </span>
                <span className="block text-sm font-semibold text-foreground">
                  {user.accessLevel === null || user.accessLevel === undefined
                    ? "Không giới hạn (Tất cả)"
                    : `Cấp độ ${user.accessLevel}`}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <User className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Họ và tên đầy đủ
                </span>
                <span className="block text-sm font-semibold text-foreground">
                  {userDisplayName(user)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Accesses Card */}
      <Card className="border bg-card shadow-none">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  Quyền truy cập phòng ban
                </CardTitle>
                <Badge className="font-mono" variant="secondary">
                  {departmentAccesses.length} phòng ban
                </Badge>
              </div>
              <CardDescription className="mt-1">
                Danh sách phòng ban mà người dùng được cấp quyền truy cập tài
                liệu.
              </CardDescription>
            </div>
            <Building className="size-6 shrink-0 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {departmentAccesses.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground italic">
              Người dùng này chưa được cấp quyền riêng cho phòng ban nào.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {departmentAccesses.map((access) => (
                <div
                  className="flex items-center justify-between rounded-xl border bg-card p-3.5 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                  key={access.departmentId}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Building className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-xs font-semibold text-foreground">
                      {access.departmentName}
                    </span>
                  </div>
                  {access.accessLevel !== null &&
                  access.accessLevel !== undefined ? (
                    <Badge variant="secondary" className="shrink-0">
                      Cấp {access.accessLevel}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="shrink-0">
                      Tất cả
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit History Card */}
      <Card className="border bg-card shadow-none">
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold">
            Lịch sử & Hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border p-3.5">
              <Clock3 className="size-4 text-muted-foreground" />
              <div>
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Đăng nhập gần nhất
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {user.lastLogin
                    ? formatAuditDate(user.lastLogin)
                    : "Chưa từng đăng nhập"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border p-3.5">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Ngày tạo tài khoản
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {formatAuditDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
