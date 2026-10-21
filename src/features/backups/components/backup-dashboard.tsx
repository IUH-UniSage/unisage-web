import { useQueryClient } from "@tanstack/react-query"
import { History, Info, Settings, TriangleAlert } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { RefreshButton } from "@/components/shared/refresh-button"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ROUTES } from "@/constants/paths"
import {
  TOUR_ANCHORS,
  tourAnchor,
  type TourAnchor,
} from "@/constants/tour-anchors"
import {
  BackupHistorySection,
  type GetRestoreAction,
} from "@/features/backups/components/backup-history-section"
import { BackupStatusCards } from "@/features/backups/components/backup-status-cards"
import { PostgresRestoreDialog } from "@/features/backups/components/postgres-restore-dialog"
import { PostgresRestoreProgress } from "@/features/backups/components/postgres-restore-progress"
import { QdrantRestoreDialog } from "@/features/backups/components/qdrant-restore-dialog"
import { QdrantSnapshotSection } from "@/features/backups/components/qdrant-snapshot-section"
import { backupKeys } from "@/features/backups/queries/keys"
import {
  useBackupOverviewQuery,
  usePostgresRestoreStatusQuery,
} from "@/features/backups/queries/use-queries"
import type {
  BackupRun,
  PostgresRestoreStatus,
} from "@/features/backups/schemas/backup-schemas"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"
import { formatDateTime } from "@/utils/date"
import { getErrorMessage } from "@/utils/error-handler"

const MAINTENANCE_SETTINGS_PATH = `${ROUTES.adminSettings}?tab=MAINTENANCE`

function Section({
  action,
  anchor,
  children,
  description,
  title,
}: {
  action?: ReactNode
  anchor: TourAnchor
  children: ReactNode
  description: string
  title: string
}) {
  return (
    <section className="space-y-3" {...tourAnchor(anchor)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function Notice({
  children,
  tone,
}: {
  children: ReactNode
  tone: "info" | "warning"
}) {
  const Icon = tone === "warning" ? TriangleAlert : Info
  return (
    <div
      className={
        tone === "warning"
          ? "flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm"
          : "flex gap-3 rounded-lg border bg-muted/40 p-3 text-sm"
      }
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-1">{children}</div>
    </div>
  )
}

export function BackupDashboard() {
  const queryClient = useQueryClient()
  const { canCreate } = useResourcePermissions("backup")
  const overviewQuery = useBackupOverviewQuery()
  const overview = overviewQuery.data

  const [isRestoreDialogOpen, setRestoreDialogOpen] = useState(false)
  // Set when the dialog is opened from a backup's file list.
  const [restoreBackupRunId, setRestoreBackupRunId] = useState<string>()
  const [qdrantToRestore, setQdrantToRestore] = useState<BackupRun | null>(null)
  // The restore this browser started, followed until it ends even while
  // the overview cannot load (the database is down for part of it).
  const [trackedRestoreId, setTrackedRestoreId] = useState<string | null>(null)
  const [dismissedRestoreId, setDismissedRestoreId] = useState<string | null>(
    null
  )

  // Read from the cache rather than the hook below, whose `enabled`
  // depends on it; the hook's own subscription re-renders this component.
  const cachedStatus = queryClient.getQueryData<PostgresRestoreStatus | null>(
    backupKeys.postgresRestoreStatus()
  )
  const trackedFinished =
    cachedStatus?.restoreRunId === trackedRestoreId && !cachedStatus?.active
  const statusQuery = usePostgresRestoreStatusQuery(
    Boolean(overview?.postgresRestore?.active) ||
      (trackedRestoreId !== null && !trackedFinished) ||
      overviewQuery.isError
  )

  const status = statusQuery.data ?? overview?.postgresRestore ?? null
  const showProgress =
    status !== null &&
    status.restoreRunId !== dismissedRestoreId &&
    (status.active || status.restoreRunId === trackedRestoreId)

  // Once the restore ends, everything on the page (history, latest runs,
  // restore points) changed under it.
  const finishedPhase = status && !status.active ? status.phase : null
  useEffect(() => {
    if (finishedPhase) {
      void queryClient.invalidateQueries({ queryKey: backupKeys.overview() })
      void queryClient.invalidateQueries({
        queryKey: [...backupKeys.all, "runs"],
      })
      void queryClient.invalidateQueries({
        queryKey: [...backupKeys.all, "restores"],
      })
    }
  }, [finishedPhase, status?.restoreRunId, queryClient])

  if (overviewQuery.isPending && !showProgress) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="h-44 rounded-xl" key={index} />
          ))}
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  const restoreActive = Boolean(status?.active)

  const getRestoreAction: GetRestoreAction | undefined =
    overview && canCreate && !overview.busy && !restoreActive
      ? (run) => {
          if (
            overview.postgresRestoreAvailable &&
            overview.restorePoints.some((point) => point.id === run.id)
          ) {
            return () => {
              setRestoreBackupRunId(run.id)
              setRestoreDialogOpen(true)
            }
          }
          if (
            overview.qdrantSnapshots.some((snapshot) => snapshot.id === run.id)
          ) {
            return () => setQdrantToRestore(run)
          }
          return undefined
        }
      : undefined

  return (
    <div className="space-y-6">
      {showProgress && status && (
        <PostgresRestoreProgress
          onDismiss={() => setDismissedRestoreId(status.restoreRunId)}
          reconnecting={statusQuery.isError || overviewQuery.isError}
          status={status}
        />
      )}

      {!overview ? (
        !restoreActive && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {getErrorMessage(overviewQuery.error)}
          </p>
        )
      ) : (
        <>
          {!overview.scheduleEnabled && (
            <Notice tone="info">
              <p>
                Sao lưu tự động đang tắt: hệ thống chỉ sao lưu khi bạn bấm “Sao
                lưu ngay”.
              </p>
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                to={MAINTENANCE_SETTINGS_PATH}
              >
                Bật và chỉnh lịch ở Cài đặt › Bảo trì
              </Link>
            </Notice>
          )}

          <Section
            action={
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to={MAINTENANCE_SETTINGS_PATH}>
                    <Settings aria-hidden="true" />
                    Lịch sao lưu
                  </Link>
                </Button>
                <RefreshButton queryKeys={[backupKeys.all]} />
              </div>
            }
            anchor={TOUR_ANCHORS.backupStatus}
            description="Bản mới nhất của từng loại. Các bản được lưu trong MinIO (bucket unisage-backups)."
            title="Sao lưu"
          >
            <BackupStatusCards canRun={canCreate} overview={overview} />
          </Section>

          <Section
            action={
              canCreate && (
                <Button
                  disabled={
                    !overview.postgresRestoreAvailable ||
                    overview.busy ||
                    restoreActive
                  }
                  onClick={() => {
                    setRestoreBackupRunId(undefined)
                    setRestoreDialogOpen(true)
                  }}
                  variant="destructive"
                >
                  <History aria-hidden="true" />
                  Khôi phục cơ sở dữ liệu
                </Button>
              )
            }
            anchor={TOUR_ANCHORS.backupRestore}
            description="Đưa toàn bộ dữ liệu hệ thống về một bản sao lưu hoặc một thời điểm trước đây."
            title="Khôi phục cơ sở dữ liệu"
          >
            {overview.postgresRestoreAvailable ? (
              <div className="grid gap-3 rounded-xl border bg-card p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Bản sao lưu có thể khôi phục
                  </p>
                  <p className="mt-0.5 font-medium">
                    {overview.restorePoints.length > 0
                      ? `${overview.restorePoints.length} bản (mới nhất ${formatDateTime(
                          overview.restorePoints[0].finishedAt ??
                            overview.restorePoints[0].startedAt
                        )})`
                      : "Chưa có"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Khôi phục về một thời điểm
                  </p>
                  <p className="mt-0.5 font-medium">
                    {overview.walArchivingConfigured && overview.pointInTimeFrom
                      ? `Từ ${formatDateTime(overview.pointInTimeFrom)} đến hiện tại`
                      : "Chưa dùng được (cần sao lưu Transaction log và một bản Full)"}
                  </p>
                </div>
              </div>
            ) : (
              <Notice tone="warning">
                <p>
                  Chưa khôi phục được từ ứng dụng: container cơ sở dữ liệu chưa
                  chạy bằng cấu hình docker-compose mới, hoặc backend chưa được
                  cấu hình thư mục khôi phục (BACKUP_RESTORE_DIR).
                </p>
                <p className="text-xs text-muted-foreground">
                  Chạy lại <code>docker compose up -d unisage-db</code> với
                  docker-compose.yml mới nhất. Xem ADR-0010 để biết thêm.
                </p>
              </Notice>
            )}
          </Section>

          <Section
            anchor={TOUR_ANCHORS.backupQdrant}
            description="Khôi phục vector của tài liệu đã nạp từ một snapshot. Chỉ collection được chọn bị thay đổi."
            title="Khôi phục Qdrant"
          >
            <QdrantSnapshotSection
              busy={overview.busy || restoreActive}
              canRestore={canCreate}
              snapshots={overview.qdrantSnapshots}
            />
          </Section>

          {isRestoreDialogOpen && (
            <PostgresRestoreDialog
              initialBackupRunId={restoreBackupRunId}
              onOpenChange={setRestoreDialogOpen}
              onStarted={(run) => {
                setDismissedRestoreId(null)
                setTrackedRestoreId(run.id)
              }}
              overview={overview}
            />
          )}

          {qdrantToRestore && (
            <QdrantRestoreDialog
              onOpenChange={(open) => !open && setQdrantToRestore(null)}
              snapshot={qdrantToRestore}
            />
          )}
        </>
      )}

      <Section
        anchor={TOUR_ANCHORS.backupHistory}
        description="Mọi lần sao lưu và khôi phục, kể cả lần thất bại."
        title="Lịch sử"
      >
        <BackupHistorySection getRestoreAction={getRestoreAction} />
      </Section>
    </div>
  )
}
