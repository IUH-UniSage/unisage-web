import { History } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { QdrantRestoreDialog } from "@/features/backups/components/qdrant-restore-dialog"
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
  const [selected, setSelected] = useState<BackupRun | null>(null)

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
                      disabled={busy}
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
        <QdrantRestoreDialog
          onOpenChange={(open) => !open && setSelected(null)}
          snapshot={selected}
        />
      )}
    </>
  )
}
