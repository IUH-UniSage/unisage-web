import { EntityStatusDialog } from "@/components/shared/dialog/entity-status-dialog"
import type { AccessPermission } from "@/features/rbac/schemas/rbac-schemas"

type PermissionStatusDialogProps = {
  isSubmitting: boolean
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
  permission: AccessPermission
}

export function PermissionStatusDialog({
  isSubmitting,
  onConfirm,
  onOpenChange,
  permission,
}: PermissionStatusDialogProps) {
  return (
    <EntityStatusDialog
      assignedToNoun="vai trò"
      entityLabel={permission.name}
      entityNoun="quyền hạn"
      isActive={permission.isActive}
      isSubmitting={isSubmitting}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  )
}
