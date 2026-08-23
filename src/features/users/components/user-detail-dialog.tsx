import { Pencil } from "lucide-react"

import { EntityStatusBadge } from "@/components/shared/list/entity-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AppUser } from "@/features/users/schemas/user-schemas"
import { formatAuditDate } from "@/utils/date-format"

function userDisplayName(user: AppUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "—"
}

type InfoRowProps = {
  label: string
  value: React.ReactNode
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <span className="block text-[11px] text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

type UserDetailDialogProps = {
  canUpdate: boolean
  onEdit: (user: AppUser) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  user?: AppUser
}

export function UserDetailDialog({
  canUpdate,
  onEdit,
  onOpenChange,
  open,
  user,
}: UserDetailDialogProps) {
  if (!user) return null

  const isActive = user.status === "ACTIVE"
  const departmentAccesses = user.departmentAccesses ?? []

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="truncate text-lg">
              {userDisplayName(user)}
            </DialogTitle>
            <EntityStatusBadge isActive={isActive} />
          </div>
          <DialogDescription className="mt-0.5">
            {user.email || "Chưa có email"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3.5 text-sm">
            <InfoRow label="Mã GV/SV" value={user.code || "—"} />
            <InfoRow label="Số điện thoại" value={user.phone || "—"} />
            <InfoRow
              label="Vai trò"
              value={user.roleName || "Chưa gán vai trò"}
            />
            <InfoRow
              label="Cấp độ truy cập"
              value={
                user.accessLevel === null || user.accessLevel === undefined
                  ? "Không giới hạn"
                  : `Cấp ${user.accessLevel}`
              }
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Phòng ban được cấp quyền ({departmentAccesses.length})
            </span>
            {departmentAccesses.length > 0 ? (
              <div className="max-h-36 divide-y overflow-y-auto rounded-lg border bg-card">
                {departmentAccesses.map((access) => (
                  <div
                    className="flex items-center justify-between px-3 py-2 text-xs"
                    key={access.departmentId}
                  >
                    <span className="truncate font-medium text-foreground">
                      {access.departmentName}
                    </span>
                    {access.accessLevel !== null &&
                    access.accessLevel !== undefined ? (
                      <Badge variant="secondary">
                        Cấp {access.accessLevel}
                      </Badge>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Chưa được cấp quyền phòng ban nào.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t pt-3 text-xs text-muted-foreground">
            <InfoRow
              label="Đăng nhập gần nhất"
              value={
                user.lastLogin
                  ? formatAuditDate(user.lastLogin)
                  : "Chưa đăng nhập"
              }
            />
            <InfoRow label="Ngày tạo" value={formatAuditDate(user.createdAt)} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Đóng
            </Button>
          </DialogClose>
          {canUpdate ? (
            <Button
              onClick={() => {
                onOpenChange(false)
                onEdit(user)
              }}
              type="button"
            >
              <Pencil aria-hidden="true" className="size-4" />
              Chỉnh sửa
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
