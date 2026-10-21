import { History, Loader2 } from "lucide-react"

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
import { useRestoreQdrantMutation } from "@/features/backups/queries/use-mutations"
import type { BackupRun } from "@/features/backups/schemas/backup-schemas"
import { formatDateTime } from "@/utils/date"

type QdrantRestoreDialogProps = {
  onOpenChange: (open: boolean) => void
  snapshot: BackupRun
}

export function QdrantRestoreDialog({
  onOpenChange,
  snapshot,
}: QdrantRestoreDialogProps) {
  const restore = useRestoreQdrantMutation()

  const handleConfirm = () => {
    restore.mutate(snapshot.id, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Khôi phục collection {snapshot.target}?</DialogTitle>
          <DialogDescription>
            Vector trong collection sẽ được thay bằng snapshot lúc{" "}
            {formatDateTime(snapshot.finishedAt ?? snapshot.startedAt)}. Tài
            liệu nạp sau thời điểm đó sẽ không tìm thấy được nữa cho đến khi nạp
            lại. Trước khi khôi phục, hệ thống tự snapshot collection hiện tại
            để có thể quay lại.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={restore.isPending} variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button
            disabled={restore.isPending}
            onClick={handleConfirm}
            variant="destructive"
          >
            {restore.isPending ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : (
              <History aria-hidden="true" />
            )}
            Khôi phục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
