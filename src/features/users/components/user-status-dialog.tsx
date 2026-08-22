import { EntityStatusDialog } from "@/components/shared/dialog/entity-status-dialog"
import type { AppUser } from "@/features/users/schemas/user-schemas"

type UserStatusDialogProps = {
  isSubmitting: boolean
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
  user: AppUser
}

export function UserStatusDialog({
  isSubmitting,
  onConfirm,
  onOpenChange,
  user,
}: UserStatusDialogProps) {
  return (
    <EntityStatusDialog
      assignedToNoun="vai trò"
      entityLabel={user.fullName ?? user.username ?? user.email ?? user.id}
      entityNoun="người dùng"
      isActive={user.isActive}
      isSubmitting={isSubmitting}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  )
}
