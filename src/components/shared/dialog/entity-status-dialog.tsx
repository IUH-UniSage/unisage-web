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

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

type EntityStatusDialogProps = {
  assignedToNoun: string
  entityLabel: string
  entityNoun: string
  isActive: boolean
  isSubmitting: boolean
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
}

export function EntityStatusDialog({
  assignedToNoun,
  entityLabel,
  entityNoun,
  isActive,
  isSubmitting,
  onConfirm,
  onOpenChange,
}: EntityStatusDialogProps) {
  const isDeactivating = isActive

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isDeactivating
              ? `Vô hiệu hóa ${entityNoun}?`
              : `Khôi phục ${entityNoun}?`}
          </DialogTitle>
          <DialogDescription>
            {isDeactivating
              ? `${capitalize(entityNoun)} ${entityLabel} sẽ không thể tiếp tục được gán cho ${assignedToNoun} mới.`
              : `${capitalize(entityNoun)} ${entityLabel} sẽ hoạt động trở lại và có thể được sử dụng.`}
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
