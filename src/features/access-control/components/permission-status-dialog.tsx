import { Power, RotateCcw } from "lucide-react"

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
import type { AccessPermission } from "@/features/access-control/schemas/access-control-schemas"

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
  const isDeactivating = permission.isActive

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isDeactivating ? "Vô hiệu hóa quyền hạn?" : "Khôi phục quyền hạn?"}
          </DialogTitle>
          <DialogDescription>
            {isDeactivating
              ? `Quyền ${permission.name} sẽ không thể tiếp tục được gán cho vai trò mới.`
              : `Quyền ${permission.name} sẽ hoạt động trở lại và có thể được sử dụng.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isSubmitting} variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button
            disabled={isSubmitting}
            onClick={() => void onConfirm()}
            variant={isDeactivating ? "destructive" : "default"}
          >
            {isDeactivating ? (
              <Power aria-hidden="true" />
            ) : (
              <RotateCcw aria-hidden="true" />
            )}
            {isSubmitting
              ? "Đang cập nhật..."
              : isDeactivating
                ? "Vô hiệu hóa"
                : "Khôi phục"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
