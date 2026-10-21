import type { BackupRun } from "@/features/backups/schemas/backup-schemas"
import { BACKUP_TYPE_LABELS } from "@/features/backups/schemas/backup-schemas"
import { formatDateTime, parseApiDate } from "@/utils/date"
import { formatFileSize } from "@/utils/file-size"

// APP_TIME_ZONE (Asia/Ho_Chi_Minh) has had no daylight saving since 1975, so
// a fixed offset converts the restore time picker exactly.
const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000
const INPUT_VALUE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

/** An API (UTC) timestamp as a `datetime-local` value in Vietnam time. */
export function toVietnamInputValue(input: string | null | undefined): string {
  const date = parseApiDate(input)
  if (!date) return ""
  return new Date(date.getTime() + VIETNAM_OFFSET_MS).toISOString().slice(0, 16)
}

/** A `datetime-local` value picked in Vietnam time, as a UTC ISO string. */
export function vietnamInputToUtc(value: string): string | null {
  if (!INPUT_VALUE.test(value)) return null
  const date = new Date(`${value}:00+07:00`)
  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString().replace(".000Z", "Z")
}

/** The label of a Full/Differential backup in the restore picker. */
export function describeRestorePoint(run: BackupRun): string {
  const parts = [
    BACKUP_TYPE_LABELS[run.backupType],
    formatDateTime(run.finishedAt ?? run.startedAt),
  ]
  if (run.sizeBytes) parts.push(formatFileSize(run.sizeBytes))
  return parts.join(" · ")
}

/** "khôi phục", "KHOI PHUC" and "Khôi Phục" all confirm. */
export function normalizeConfirmation(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

export const RESTORE_CONFIRMATION_TEXT = "khôi phục"

export function isRestoreConfirmed(text: string): boolean {
  return (
    normalizeConfirmation(text) ===
    normalizeConfirmation(RESTORE_CONFIRMATION_TEXT)
  )
}
