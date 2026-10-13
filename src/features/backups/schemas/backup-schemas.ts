import { z } from "zod"

// Mirrors backend UNISAGE-102 (ADR-0008/0009/0010): backup_runs,
// restore_runs and the restore job phases the unisage-db container writes.
export const backupTypeSchema = z.enum([
  "FULL",
  "DIFFERENTIAL",
  "WAL",
  "QDRANT_SNAPSHOT",
])

export type BackupType = z.infer<typeof backupTypeSchema>

export const BACKUP_TYPE_LABELS: Record<BackupType, string> = {
  DIFFERENTIAL: "Differential",
  FULL: "Full",
  QDRANT_SNAPSHOT: "Snapshot Qdrant",
  WAL: "Transaction log",
}

export const BACKUP_TYPE_DESCRIPTIONS: Record<BackupType, string> = {
  DIFFERENTIAL: "Phần thay đổi so với bản Full gần nhất",
  FULL: "Toàn bộ cơ sở dữ liệu",
  QDRANT_SNAPSHOT: "Vector của tài liệu đã nạp",
  WAL: "Nhật ký giao dịch, dùng để khôi phục về một thời điểm",
}

export const backupStatusSchema = z.enum(["RUNNING", "SUCCEEDED", "FAILED"])

export type BackupStatus = z.infer<typeof backupStatusSchema>

export const BACKUP_STATUS_LABELS: Record<BackupStatus, string> = {
  FAILED: "Thất bại",
  RUNNING: "Đang chạy",
  SUCCEEDED: "Thành công",
}

const BACKUP_STATUS_BADGE_CLASSNAME: Record<BackupStatus, string> = {
  FAILED: "border-transparent bg-destructive/10 text-destructive",
  RUNNING: "border-transparent bg-primary/10 text-primary",
  SUCCEEDED: "border-transparent bg-success/10 text-success",
}

export function getBackupStatusBadgeClassName(status: BackupStatus): string {
  return BACKUP_STATUS_BADGE_CLASSNAME[status]
}

export const restoreTypeSchema = z.enum(["POSTGRES", "QDRANT"])

export type RestoreType = z.infer<typeof restoreTypeSchema>

export const RESTORE_TYPE_LABELS: Record<RestoreType, string> = {
  POSTGRES: "Cơ sở dữ liệu",
  QDRANT: "Qdrant",
}

export const restorePhaseSchema = z.enum([
  "PREPARING",
  "APPLYING",
  "RECOVERING",
  "SUCCEEDED",
  "FAILED",
])

export type RestorePhase = z.infer<typeof restorePhaseSchema>

export const RESTORE_PHASE_LABELS: Record<RestorePhase, string> = {
  APPLYING: "Thay dữ liệu",
  FAILED: "Thất bại",
  PREPARING: "Chuẩn bị",
  RECOVERING: "Phát lại nhật ký",
  SUCCEEDED: "Hoàn tất",
}

// The phases a restore goes through, in order - drives the progress steps.
export const RESTORE_PHASE_STEPS: RestorePhase[] = [
  "PREPARING",
  "APPLYING",
  "RECOVERING",
  "SUCCEEDED",
]

export const backupRunSchema = z.object({
  backupType: backupTypeSchema,
  baseRunId: z.string().nullish(),
  errorMessage: z.string().nullish(),
  fileCount: z.number().int().nullish(),
  finishedAt: z.string().nullish(),
  id: z.string(),
  purgedAt: z.string().nullish(),
  // app.timezone wall time (the schedule slot), unlike the UTC fields.
  scheduledFor: z.string().nullish(),
  sizeBytes: z.number().nullish(),
  startedAt: z.string(),
  status: backupStatusSchema,
  storagePrefix: z.string().nullish(),
  target: z.string().nullish(),
})

export type BackupRun = z.infer<typeof backupRunSchema>

export const restoreRunSchema = z.object({
  errorMessage: z.string().nullish(),
  finishedAt: z.string().nullish(),
  id: z.string(),
  requestedByCode: z.string().nullish(),
  restoreType: restoreTypeSchema,
  safetyRunId: z.string().nullish(),
  sourceRunId: z.string().nullish(),
  startedAt: z.string(),
  status: backupStatusSchema,
  target: z.string().nullish(),
  targetTime: z.string().nullish(),
})

export type RestoreRun = z.infer<typeof restoreRunSchema>

export const postgresRestoreStatusSchema = z.object({
  active: z.boolean(),
  message: z.string().nullish(),
  phase: restorePhaseSchema,
  restoreRunId: z.string(),
  updatedAt: z.string().nullish(),
})

export type PostgresRestoreStatus = z.infer<typeof postgresRestoreStatusSchema>

export const backupOverviewSchema = z.object({
  busy: z.boolean(),
  latestRuns: z.array(backupRunSchema),
  pointInTimeFrom: z.string().nullish(),
  pointInTimeTo: z.string().nullish(),
  postgresRestore: postgresRestoreStatusSchema.nullish(),
  postgresRestoreAvailable: z.boolean(),
  qdrantSnapshots: z.array(backupRunSchema),
  restorePoints: z.array(backupRunSchema),
  scheduleEnabled: z.boolean(),
  walArchivingConfigured: z.boolean(),
})

export type BackupOverview = z.infer<typeof backupOverviewSchema>

const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    data: z.array(item),
    limit: z.number().int().nonnegative(),
    page: z.number().int().nonnegative(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  })

export const backupRunPageSchema = pageSchema(backupRunSchema)

export type BackupRunPage = z.infer<typeof backupRunPageSchema>

export const restoreRunPageSchema = pageSchema(restoreRunSchema)

export type RestoreRunPage = z.infer<typeof restoreRunPageSchema>

// Exactly one of the two (backend PostgresRestoreRequest).
export type PostgresRestoreRequest =
  | { backupRunId: string; targetTime?: never }
  | { backupRunId?: never; targetTime: string }
