import { AlertTriangle, History, Loader2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRestorePostgresMutation } from "@/features/backups/queries/use-mutations"
import type {
  BackupOverview,
  PostgresRestoreRequest,
  RestoreRun,
} from "@/features/backups/schemas/backup-schemas"
import {
  describeRestorePoint,
  isRestoreConfirmed,
  RESTORE_CONFIRMATION_TEXT,
  toVietnamInputValue,
  vietnamInputToUtc,
} from "@/features/backups/utils/backup-format"
import { formatDateTime } from "@/utils/date"

type RestoreMode = "point" | "time"

type PostgresRestoreDialogProps = {
  onOpenChange: (open: boolean) => void
  onStarted: (run: RestoreRun) => void
  overview: BackupOverview
}

export function PostgresRestoreDialog({
  onOpenChange,
  onStarted,
  overview,
}: PostgresRestoreDialogProps) {
  const restore = useRestorePostgresMutation()
  const canPickTime =
    overview.walArchivingConfigured && Boolean(overview.pointInTimeFrom)

  const [mode, setMode] = useState<RestoreMode>("point")
  const [backupRunId, setBackupRunId] = useState(
    overview.restorePoints[0]?.id ?? ""
  )
  const [time, setTime] = useState("")
  const [confirmation, setConfirmation] = useState("")

  const minTime = toVietnamInputValue(overview.pointInTimeFrom)
  // pointInTimeTo is "now" when the overview was loaded.
  const maxTime = toVietnamInputValue(overview.pointInTimeTo)
  const targetTime = vietnamInputToUtc(time)
  const timeInRange =
    targetTime !== null &&
    (!minTime || time >= minTime) &&
    (!maxTime || time <= maxTime)

  const request: PostgresRestoreRequest | null =
    mode === "point"
      ? backupRunId
        ? { backupRunId }
        : null
      : timeInRange && targetTime
        ? { targetTime }
        : null

  const canSubmit =
    request !== null && isRestoreConfirmed(confirmation) && !restore.isPending

  const handleSubmit = () => {
    if (!request) return
    restore.mutate(request, {
      onSuccess: (run) => {
        onStarted(run)
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Khôi phục cơ sở dữ liệu</DialogTitle>
          <DialogDescription>
            Đưa toàn bộ dữ liệu của hệ thống (người dùng, tài liệu, hội thoại,
            cấu hình...) về đúng như lúc trước.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup
            className="grid gap-2 sm:grid-cols-2"
            onValueChange={(value) => setMode(value as RestoreMode)}
            value={mode}
          >
            <Label
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
              htmlFor="restore-mode-point"
            >
              <RadioGroupItem id="restore-mode-point" value="point" />
              <span className="space-y-0.5">
                <span className="block text-sm font-medium">
                  Về một bản sao lưu
                </span>
                <span className="block text-xs font-normal text-muted-foreground">
                  Dữ liệu như lúc bản Full/Differential được tạo.
                </span>
              </span>
            </Label>
            <Label
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-data-[disabled]:cursor-not-allowed has-data-[disabled]:opacity-60 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
              htmlFor="restore-mode-time"
            >
              <RadioGroupItem
                disabled={!canPickTime}
                id="restore-mode-time"
                value="time"
              />
              <span className="space-y-0.5">
                <span className="block text-sm font-medium">
                  Về một thời điểm
                </span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {canPickTime
                    ? "Chọn chính xác đến từng phút, nhờ Transaction log."
                    : "Cần bật sao lưu Transaction log và có ít nhất một bản Full."}
                </span>
              </span>
            </Label>
          </RadioGroup>

          {mode === "point" ? (
            <div className="space-y-1.5">
              <Label htmlFor="restore-point">Bản sao lưu</Label>
              {overview.restorePoints.length > 0 ? (
                <Select onValueChange={setBackupRunId} value={backupRunId}>
                  <SelectTrigger className="w-full" id="restore-point">
                    <SelectValue placeholder="Chọn bản sao lưu" />
                  </SelectTrigger>
                  <SelectContent>
                    {overview.restorePoints.map((run) => (
                      <SelectItem key={run.id} value={run.id}>
                        {describeRestorePoint(run)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có bản Full hoặc Differential nào để khôi phục. Hãy chạy
                  “Sao lưu ngay” cho bản Full trước.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="restore-time">Thời điểm (giờ Việt Nam)</Label>
              <Input
                aria-invalid={Boolean(time) && !timeInRange}
                id="restore-time"
                max={maxTime || undefined}
                min={minTime || undefined}
                onChange={(event) => setTime(event.target.value)}
                type="datetime-local"
                value={time}
              />
              <p className="text-xs text-muted-foreground">
                Chọn trong khoảng {formatDateTime(overview.pointInTimeFrom)} đến{" "}
                {formatDateTime(overview.pointInTimeTo)}.
              </p>
            </div>
          )}

          <div className="flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-warning-foreground"
            />
            <ul className="list-disc space-y-1 pl-4 text-xs leading-5">
              <li>
                Mọi thay đổi sau thời điểm được chọn sẽ mất (trừ lịch sử sao
                lưu).
              </li>
              <li>
                Hệ thống tạm ngưng trong lúc khôi phục, thường khoảng một đến
                vài phút. Người dùng khác có thể gặp lỗi trong lúc này.
              </li>
              <li>
                Trước khi khôi phục, hệ thống tự tạo một bản Full an toàn của dữ
                liệu hiện tại để có thể quay lại nếu chọn nhầm.
              </li>
              <li>
                Nếu khôi phục lỗi giữa chừng, dữ liệu hiện tại được giữ nguyên.
              </li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="restore-confirmation">
              Gõ “{RESTORE_CONFIRMATION_TEXT}” để xác nhận
            </Label>
            <Input
              autoComplete="off"
              id="restore-confirmation"
              onChange={(event) => setConfirmation(event.target.value)}
              value={confirmation}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={restore.isPending} variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button
            disabled={!canSubmit}
            onClick={handleSubmit}
            variant="destructive"
          >
            {restore.isPending ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : (
              <History aria-hidden="true" />
            )}
            {restore.isPending ? "Đang bắt đầu..." : "Khôi phục"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
