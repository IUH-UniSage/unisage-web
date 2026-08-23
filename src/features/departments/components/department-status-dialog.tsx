import { EntityStatusDialog } from "@/components/shared/dialog/entity-status-dialog"
import type { Department } from "@/features/departments/schemas/department-schemas"

type DepartmentStatusDialogProps = {
  department: Department
  isSubmitting: boolean
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
}

export function DepartmentStatusDialog({
  department,
  isSubmitting,
  onConfirm,
  onOpenChange,
}: DepartmentStatusDialogProps) {
  return (
    <EntityStatusDialog
      assignedToNoun="người dùng"
      entityLabel={department.name}
      entityNoun="phòng ban"
      isActive={department.isActive ?? true}
      isSubmitting={isSubmitting}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  )
}
