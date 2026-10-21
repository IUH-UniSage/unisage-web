import {
  Database,
  FileClock,
  Layers,
  Loader2,
  Play,
  Sparkles,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  runNowSuccessMessage,
  useRunBackupNowMutation,
} from "@/features/backups/queries/use-mutations"
import {
  BACKUP_STATUS_LABELS,
  BACKUP_TYPE_DESCRIPTIONS,
  BACKUP_TYPE_LABELS,
  getBackupStatusBadgeClassName,
  type BackupOverview,
  type BackupRun,
  type BackupType,
} from "@/features/backups/schemas/backup-schemas"
import { formatDateTime, formatRelativeTime } from "@/utils/date"
import { formatFileSize } from "@/utils/file-size"

const CARD_TYPES: BackupType[] = [
  "FULL",
  "DIFFERENTIAL",
  "WAL",
  "QDRANT_SNAPSHOT",
]

const CARD_ICONS: Record<BackupType, LucideIcon> = {
  DIFFERENTIAL: Layers,
  FULL: Database,
  QDRANT_SNAPSHOT: Sparkles,
  WAL: FileClock,
}

type BackupStatusCardsProps = {
  canRun: boolean
  overview: BackupOverview
}

// One card per backup type: the latest run and a "Sao lưu ngay" button.
// Qdrant keeps one run per collection, so its card shows the newest one.
export function BackupStatusCards({
  canRun,
  overview,
}: BackupStatusCardsProps) {
  const runNow = useRunBackupNowMutation()

  const latestByType = new Map<BackupType, BackupRun>()
  for (const run of overview.latestRuns) {
    const current = latestByType.get(run.backupType)
    if (!current || current.startedAt < run.startedAt) {
      latestByType.set(run.backupType, run)
    }
  }

  const disabledReason = (type: BackupType): string | null => {
    if (overview.busy) return "Đang có tác vụ sao lưu/khôi phục chạy"
    if (type === "WAL" && !overview.walArchivingConfigured) {
      return "Chưa cấu hình thư mục WAL archive"
    }
    if (type === "DIFFERENTIAL" && !latestByType.has("FULL")) {
      return "Cần có một bản Full trước"
    }
    return null
  }

  const handleRun = (type: BackupType) => {
    runNow.mutate(type, {
      onSuccess: () => toast.success(runNowSuccessMessage(type)),
    })
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {CARD_TYPES.map((type) => {
        const Icon = CARD_ICONS[type]
        const run = latestByType.get(type)
        const reason = disabledReason(type)
        const isStarting = runNow.isPending && runNow.variables === type

        return (
          <section
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs"
            key={type}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="size-4.5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">
                  {BACKUP_TYPE_LABELS[type]}
                </h3>
                <p className="text-xs leading-5 text-muted-foreground">
                  {BACKUP_TYPE_DESCRIPTIONS[type]}
                </p>
              </div>
            </div>

            <div className="min-h-14 space-y-1 text-sm">
              {run ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={getBackupStatusBadgeClassName(run.status)}
                    >
                      {run.status === "RUNNING" && (
                        <Loader2 aria-hidden="true" className="animate-spin" />
                      )}
                      {BACKUP_STATUS_LABELS[run.status]}
                    </Badge>
                    <span
                      className="text-xs text-muted-foreground"
                      title={formatDateTime(run.startedAt)}
                    >
                      {formatRelativeTime(run.startedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[
                      run.target,
                      run.sizeBytes ? formatFileSize(run.sizeBytes) : null,
                      run.fileCount && type === "WAL"
                        ? `${run.fileCount} đoạn`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || formatDateTime(run.startedAt)}
                  </p>
                  {run.status === "FAILED" && run.errorMessage && (
                    <p
                      className="line-clamp-2 text-xs text-destructive"
                      title={run.errorMessage}
                    >
                      {run.errorMessage}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Chưa có bản sao lưu nào.
                </p>
              )}
            </div>

            {canRun && (
              <Button
                className="mt-auto w-full"
                disabled={Boolean(reason) || runNow.isPending}
                onClick={() => handleRun(type)}
                size="sm"
                title={reason ?? undefined}
                variant="outline"
              >
                {isStarting ? (
                  <Loader2 aria-hidden="true" className="animate-spin" />
                ) : (
                  <Play aria-hidden="true" />
                )}
                Sao lưu ngay
              </Button>
            )}
          </section>
        )
      })}
    </div>
  )
}
