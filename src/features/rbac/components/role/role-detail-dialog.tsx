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
import type { AccessRole } from "@/features/rbac/schemas/rbac-schemas"
import { formatAuditDate } from "@/utils/date-format"

type RoleDetailDialogProps = {
  canUpdate: boolean
  onEdit: (role: AccessRole) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  role?: AccessRole
}

export function RoleDetailDialog({
  canUpdate,
  onEdit,
  onOpenChange,
  open,
  role,
}: RoleDetailDialogProps) {
  if (!role) return null

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="truncate text-lg">{role.name}</DialogTitle>
            <EntityStatusBadge isActive={role.isActive} />
          </div>
          <DialogDescription className="mt-0.5">
            {role.isSystemRole ? "Vai trò hệ thống" : "Vai trò tùy chỉnh"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="rounded-lg border bg-muted/30 p-3.5">
            <p className="text-xs font-semibold text-muted-foreground">Mô tả</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {role.description || "Chưa có mô tả cho vai trò này."}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Quyền hạn ({role.permissions.length})
            </span>
            {role.permissions.length > 0 ? (
              <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto rounded-lg border bg-card p-3">
                {role.permissions.map((permission) => (
                  <Badge
                    className="max-w-full truncate"
                    key={permission.id}
                    variant="outline"
                  >
                    {permission.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Chưa cấp quyền hạn nào.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t pt-3 text-xs text-muted-foreground">
            <div>
              <span className="block text-[11px]">Người tạo</span>
              <span className="font-medium text-foreground">
                {role.createdBy || "Hệ thống"}
              </span>
            </div>
            <div>
              <span className="block text-[11px]">Ngày tạo</span>
              <span className="font-medium text-foreground">
                {formatAuditDate(role.createdAt)}
              </span>
            </div>
            {role.updatedAt ? (
              <>
                <div>
                  <span className="block text-[11px]">Người cập nhật</span>
                  <span className="font-medium text-foreground">
                    {role.updatedBy || "Hệ thống"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px]">Cập nhật lần cuối</span>
                  <span className="font-medium text-foreground">
                    {formatAuditDate(role.updatedAt)}
                  </span>
                </div>
              </>
            ) : null}
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
                onEdit(role)
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
