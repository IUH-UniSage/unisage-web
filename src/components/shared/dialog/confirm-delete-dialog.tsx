import { Trash2 } from "lucide-react"

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

type ConfirmDeleteDialogProps = {
  description: string
  entityLabel: string
  isSubmitting: boolean
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
  title: string
}

export function ConfirmDeleteDialog({
  description,
  entityLabel,
  isSubmitting,
  onConfirm,
  onOpenChange,
  title,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            variant="destructive"
          >
            <Trash2 aria-hidden="true" />
            {isSubmitting ? "Đang xóa..." : `Xóa ${entityLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
