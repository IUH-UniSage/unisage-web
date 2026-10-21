import { Download, History } from "lucide-react"

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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useBackupRunFilesQuery } from "@/features/backups/queries/use-queries"
import {
  BACKUP_TYPE_LABELS,
  type BackupRun,
} from "@/features/backups/schemas/backup-schemas"
import { formatDateTime } from "@/utils/date"
import { getErrorMessage } from "@/utils/error-handler"
import { formatFileSize } from "@/utils/file-size"

type BackupFilesDialogProps = {
  onOpenChange: (open: boolean) => void
  // Set when this run can be restored right now; the dashboard opens the
  // matching restore confirmation.
  onRestore?: () => void
  run: BackupRun
}

export function BackupFilesDialog({
  onOpenChange,
  onRestore,
  run,
}: BackupFilesDialogProps) {
  const { data: files, error, isPending } = useBackupRunFilesQuery(run.id)
  const totalSize = files?.reduce((sum, file) => sum + file.sizeBytes, 0) ?? 0

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {BACKUP_TYPE_LABELS[run.backupType]}
            {run.target ? ` ${run.target}` : ""} ·{" "}
            {formatDateTime(run.startedAt)}
          </DialogTitle>
          <DialogDescription>
            Các file của bản sao lưu này trong MinIO, đường dẫn{" "}
            <code className="text-xs break-all">{run.storagePrefix}</code>.
            {run.backupType === "WAL" &&
              " Chỉ gồm các đoạn nhật ký được đẩy lên trong lần chạy này."}
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton className="h-9 w-full" key={index} />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {getErrorMessage(error)}
          </p>
        ) : files.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            Không còn file nào trong MinIO cho bản sao lưu này.
          </p>
        ) : (
          <div className="max-h-96 overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên file</TableHead>
                  <TableHead className="text-right">Dung lượng</TableHead>
                  <TableHead className="w-0" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.key}>
                    <TableCell className="font-mono text-xs break-all">
                      {file.name}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap tabular-nums">
                      {formatFileSize(file.sizeBytes)}
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <a
                          download={file.downloadName}
                          href={file.downloadUrl}
                          rel="noopener noreferrer"
                          title={`Tải về với tên ${file.downloadName}`}
                        >
                          <Download aria-hidden="true" />
                          Tải
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {files && files.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {files.length} file · tổng {formatFileSize(totalSize)}. Link tải có
            hiệu lực trong một giờ.
          </p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
          {onRestore && (
            <Button onClick={onRestore} variant="destructive">
              <History aria-hidden="true" />
              Khôi phục về bản này
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
