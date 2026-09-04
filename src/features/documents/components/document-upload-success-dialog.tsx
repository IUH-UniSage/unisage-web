import { CheckCircle2 } from "lucide-react"

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

type DocumentUploadSuccessDialogProps = {
  documentTitle: string
  onIngestNow: () => void
  onOpenChange: (open: boolean) => void
}

export function DocumentUploadSuccessDialog({
  documentTitle,
  onIngestNow,
  onOpenChange,
}: DocumentUploadSuccessDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mb-1 grid size-12 place-items-center rounded-full bg-success/15 text-success">
            <CheckCircle2 aria-hidden="true" className="size-6" />
          </div>
          <DialogTitle>Tải lên thành công</DialogTitle>
          <DialogDescription>
            Tài liệu "{documentTitle}" đã được tải lên. Xử lý nạp liệu ngay để
            đưa vào hệ thống tri thức?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Để sau
            </Button>
          </DialogClose>
          <Button onClick={onIngestNow} type="button">
            Xử lý nạp liệu ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
