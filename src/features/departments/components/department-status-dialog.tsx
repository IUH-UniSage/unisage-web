import { EntityStatusDialog } from "@/components/shared/dialog/entity-status-dialog"
import type { Department } from "@/features/departments/schemas/department-schemas"
import { departmentLabel } from "@/features/departments/utils/department-label"

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
      entityLabel={departmentLabel(department)}
      entityNoun="phòng ban"
      isActive={department.isActive ?? true}
      isSubmitting={isSubmitting}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  )
}
