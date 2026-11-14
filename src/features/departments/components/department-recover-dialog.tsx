import { Loader2, RotateCcw } from "lucide-react"

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

type DepartmentRecoverDialogProps = {
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onRecover: (includeChildren: boolean) => Promise<void>
  /** e.g. `"Khoa CNTT"` or `"3 phòng ban đã chọn"`. */
  subject: string
}

// Recovering a unit that has child units: ask whether the children come back too (the backend's
// includeChildren). Units without children use the plain status dialog instead.
export function DepartmentRecoverDialog({
  isSubmitting,
  onOpenChange,
  onRecover,
  subject,
}: DepartmentRecoverDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Khôi phục {subject}?</DialogTitle>
          <DialogDescription>
            Đơn vị này có đơn vị trực thuộc. Bạn muốn khôi phục luôn các đơn vị
            trực thuộc hay chỉ khôi phục đơn vị này?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:flex-wrap">
          <DialogClose asChild>
            <Button disabled={isSubmitting} variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button
            disabled={isSubmitting}
            onClick={() => void onRecover(false)}
            variant="outline"
          >
            Chỉ đơn vị này
          </Button>
          <Button disabled={isSubmitting} onClick={() => void onRecover(true)}>
            {isSubmitting ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : (
              <RotateCcw aria-hidden="true" />
            )}
            Khôi phục cả đơn vị trực thuộc
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
