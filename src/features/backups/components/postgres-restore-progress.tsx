import { CheckCircle2, Circle, Loader2, X, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  RESTORE_PHASE_LABELS,
  RESTORE_PHASE_STEPS,
  type PostgresRestoreStatus,
} from "@/features/backups/schemas/backup-schemas"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/utils/date"

type PostgresRestoreProgressProps = {
  onDismiss: () => void
  // True while the last status poll failed - expected while Postgres is
  // stopped, since the backend checks permissions against the database.
  reconnecting: boolean
  status: PostgresRestoreStatus
}

export function PostgresRestoreProgress({
  onDismiss,
  reconnecting,
  status,
}: PostgresRestoreProgressProps) {
  const failed = status.phase === "FAILED"
  const succeeded = status.phase === "SUCCEEDED"
  const reachedIndex = RESTORE_PHASE_STEPS.indexOf(status.phase)

  return (
    <section
      aria-live="polite"
      className={cn(
        "rounded-xl border p-4",
        failed && "border-destructive/30 bg-destructive/5",
        succeeded && "border-success/30 bg-success/5",
        status.active && "border-primary/30 bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">
          {failed ? (
            <XCircle aria-hidden="true" className="size-5 text-destructive" />
          ) : succeeded ? (
            <CheckCircle2 aria-hidden="true" className="size-5 text-success" />
          ) : (
            <Loader2
              aria-hidden="true"
              className="size-5 animate-spin text-primary"
            />
          )}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-sm font-semibold">
            {failed
              ? "Khôi phục cơ sở dữ liệu thất bại"
              : succeeded
                ? "Đã khôi phục cơ sở dữ liệu"
                : "Đang khôi phục cơ sở dữ liệu"}
          </h3>
          {status.message && (
            <p className="text-sm text-muted-foreground">{status.message}</p>
          )}
          {status.active && (
            <p className="text-xs text-muted-foreground">
              {reconnecting
                ? "Cơ sở dữ liệu đang khởi động lại nên hệ thống tạm thời không phản hồi. Trang sẽ tự cập nhật, bạn không cần tải lại."
                : "Trong lúc khôi phục, các chức năng khác của hệ thống có thể tạm thời không dùng được."}
            </p>
          )}
          {succeeded && (
            <p className="text-xs text-muted-foreground">
              Nếu bạn bị đăng xuất, hãy đăng nhập lại: phiên đăng nhập tạo sau
              thời điểm khôi phục không còn trong dữ liệu.
            </p>
          )}
          {status.updatedAt && (
            <p className="text-xs text-muted-foreground">
              Cập nhật lúc {formatDateTime(status.updatedAt)}
            </p>
          )}
        </div>
        {!status.active && (
          <Button
            aria-label="Ẩn thông báo"
            onClick={onDismiss}
            size="icon-sm"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        )}
      </div>

      {!failed && (
        <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {RESTORE_PHASE_STEPS.map((phase, index) => {
            const done = index < reachedIndex || succeeded
            const current = index === reachedIndex && !succeeded

            return (
              <li
                className={cn(
                  "flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs",
                  current && "border-primary/40 text-primary",
                  !done && !current && "text-muted-foreground"
                )}
                key={phase}
              >
                {done ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-4 text-success"
                  />
                ) : current ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Circle aria-hidden="true" className="size-4" />
                )}
                {RESTORE_PHASE_LABELS[phase]}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
