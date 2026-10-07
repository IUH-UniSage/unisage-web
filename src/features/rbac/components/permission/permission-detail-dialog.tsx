import { Pencil } from "lucide-react"

import { AuditInfo } from "@/components/shared/audit-info"
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
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { DialogTourButton } from "@/features/product-tour"
import type { AccessPermission } from "@/features/rbac/schemas/rbac-schemas"
import {
  getPermissionLabel,
  getResourceLabel,
  splitPermissionName,
} from "@/features/rbac/utils/rbac-formatters"

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
        <DialogTourButton tourKey="permission-detail" />
        <DialogHeader {...tourAnchor(TOUR_ANCHORS.dialogHeader)}>
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
          <AuditInfo
            createdAt={permission.createdAt}
            createdByName={permission.createdByName}
            updatedAt={permission.updatedAt}
            updatedByName={permission.updatedByName}
          />
        </div>

        <DialogFooter
          {...tourAnchor(TOUR_ANCHORS.dialogFooter)}
          className="gap-2 sm:gap-2"
        >
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
