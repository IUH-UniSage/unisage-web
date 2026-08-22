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

type BulkStatusDialogProps = {
  action: "deactivate" | "recover"
  assignedToNoun: string
  count: number
  entityNoun: string
  isSubmitting: boolean
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
}

export function BulkStatusDialog({
  action,
  assignedToNoun,
  count,
  entityNoun,
  isSubmitting,
  onConfirm,
  onOpenChange,
}: BulkStatusDialogProps) {
  const isDeactivating = action === "deactivate"

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isDeactivating
              ? `Vô hiệu hóa ${count} ${entityNoun} đã chọn?`
              : `Khôi phục ${count} ${entityNoun} đã chọn?`}
          </DialogTitle>
          <DialogDescription>
            {isDeactivating
              ? `${count} ${entityNoun} sẽ không thể tiếp tục được gán cho ${assignedToNoun} mới.`
              : `${count} ${entityNoun} sẽ hoạt động trở lại và có thể được sử dụng.`}
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
