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
import type { AccessRole } from "@/features/access-control/schemas/access-control-schemas"

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
  const isDeactivating = role.isActive

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isDeactivating ? "Vô hiệu hóa vai trò?" : "Khôi phục vai trò?"}
          </DialogTitle>
          <DialogDescription>
            {isDeactivating
              ? `Vai trò ${role.name} sẽ không thể tiếp tục được gán cho tài khoản mới.`
              : `Vai trò ${role.name} sẽ hoạt động trở lại và có thể được sử dụng.`}
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
