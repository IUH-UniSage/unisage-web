import { History, Loader2 } from "lucide-react"
import { useState } from "react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRestoreQdrantMutation } from "@/features/backups/queries/use-mutations"
import type { BackupRun } from "@/features/backups/schemas/backup-schemas"
import { formatDateTime, formatRelativeTime } from "@/utils/date"
import { formatFileSize } from "@/utils/file-size"

type QdrantSnapshotSectionProps = {
  busy: boolean
  canRestore: boolean
  snapshots: BackupRun[]
}

export function QdrantSnapshotSection({
  busy,
  canRestore,
  snapshots,
}: QdrantSnapshotSectionProps) {
  const restore = useRestoreQdrantMutation()
  const [selected, setSelected] = useState<BackupRun | null>(null)

  const handleConfirm = () => {
    if (!selected) return
    restore.mutate(selected.id, { onSuccess: () => setSelected(null) })
  }

  if (snapshots.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
        Chưa có snapshot Qdrant nào. Bấm “Sao lưu ngay” ở thẻ Snapshot Qdrant để
        tạo bản đầu tiên.
      </p>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collection</TableHead>
              <TableHead>Thời điểm</TableHead>
              <TableHead className="text-right">Dung lượng</TableHead>
              {canRestore && <TableHead className="w-0" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshots.map((snapshot) => (
              <TableRow key={snapshot.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {snapshot.target}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDateTime(snapshot.finishedAt ?? snapshot.startedAt)}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {formatRelativeTime(
                      snapshot.finishedAt ?? snapshot.startedAt
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap tabular-nums">
                  {formatFileSize(snapshot.sizeBytes)}
                </TableCell>
                {canRestore && (
                  <TableCell>
                    <Button
                      disabled={busy || restore.isPending}
                      onClick={() => setSelected(snapshot)}
                      size="sm"
                      title={
                        busy
                          ? "Đang có tác vụ sao lưu/khôi phục chạy"
                          : undefined
                      }
                      variant="outline"
                    >
                      <History aria-hidden="true" />
                      Khôi phục
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <Dialog onOpenChange={(open) => !open && setSelected(null)} open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Khôi phục collection {selected.target}?</DialogTitle>
              <DialogDescription>
                Vector trong collection sẽ được thay bằng snapshot lúc{" "}
                {formatDateTime(selected.finishedAt ?? selected.startedAt)}. Tài
                liệu nạp sau thời điểm đó sẽ không tìm thấy được nữa cho đến khi
                nạp lại. Trước khi khôi phục, hệ thống tự snapshot collection
                hiện tại để có thể quay lại.
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
      )}
    </>
  )
}
