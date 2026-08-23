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
import { getResourceTypeBadgeClassName } from "@/constants/resource-types"
import type { AccessPermission } from "@/features/rbac/schemas/rbac-schemas"
import {
  getPermissionLabel,
  getResourceLabel,
  splitPermissionName,
} from "@/features/rbac/utils/rbac-formatters"
import { formatAuditDate } from "@/utils/date-format"

type PermissionDetailDialogProps = {
  canUpdate: boolean
  onEdit: (permission: AccessPermission) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  permission?: AccessPermission
}

export function PermissionDetailDialog({
  canUpdate,
  onEdit,
  onOpenChange,
  open,
  permission,
}: PermissionDetailDialogProps) {
  if (!permission) return null

  const { resource } = splitPermissionName(permission.name)

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="truncate text-lg">
              {permission.name}
            </DialogTitle>
            <EntityStatusBadge isActive={permission.isActive} />
          </div>
          <DialogDescription className="mt-0.5 flex flex-wrap items-center gap-2">
            <Badge className={getResourceTypeBadgeClassName(resource)}>
              {getResourceLabel(resource)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {getPermissionLabel(permission)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="rounded-lg border bg-muted/30 p-3.5">
            <p className="text-xs font-semibold text-muted-foreground">
              Cấp độ truy cập
            </p>
            <p className="mt-1.5">
              {permission.accessLevel === null ? (
                <Badge variant="outline">Không giới hạn</Badge>
              ) : (
                <Badge variant="secondary">Cấp {permission.accessLevel}</Badge>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t pt-3 text-xs text-muted-foreground">
            <div>
              <span className="block text-[11px]">Người tạo</span>
              <span className="font-medium text-foreground">
                {permission.createdBy || "Hệ thống"}
              </span>
            </div>
            <div>
              <span className="block text-[11px]">Ngày tạo</span>
              <span className="font-medium text-foreground">
                {formatAuditDate(permission.createdAt)}
              </span>
            </div>
            {permission.updatedAt ? (
              <div className="col-span-2">
                <span className="block text-[11px]">Cập nhật lần cuối</span>
                <span className="font-medium text-foreground">
                  {formatAuditDate(permission.updatedAt)}
                </span>
              </div>
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
                onEdit(permission)
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
