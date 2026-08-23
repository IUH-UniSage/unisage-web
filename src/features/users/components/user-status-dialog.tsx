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
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    user.id

  return (
    <EntityStatusDialog
      assignedToNoun="tài liệu và quyền hạn"
      entityLabel={displayName}
      entityNoun="người dùng"
      isActive={user.status === "ACTIVE"}
      isSubmitting={isSubmitting}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  )
}
