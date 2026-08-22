import { EntityStatusDialog } from "@/components/shared/dialog/entity-status-dialog"
import type { AccessRole } from "@/features/rbac/schemas/rbac-schemas"

type RoleStatusDialogProps = {
  isSubmitting: boolean
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
  role: AccessRole
}

export function RoleStatusDialog({
  isSubmitting,
  onConfirm,
  onOpenChange,
  role,
}: RoleStatusDialogProps) {
  return (
    <EntityStatusDialog
      assignedToNoun="tài khoản"
      entityLabel={role.name}
      entityNoun="vai trò"
      isActive={role.isActive}
      isSubmitting={isSubmitting}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  )
}
