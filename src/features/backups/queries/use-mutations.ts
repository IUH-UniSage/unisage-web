import { useMutation } from "@tanstack/react-query"

import { backupApi } from "@/features/backups/api/backup-api"
import { backupKeys } from "@/features/backups/queries/keys"
import {
  BACKUP_TYPE_LABELS,
  type BackupType,
  type PostgresRestoreRequest,
} from "@/features/backups/schemas/backup-schemas"

export function useRunBackupNowMutation() {
  return useMutation({
    meta: { invalidatesQuery: backupKeys.all },
    mutationFn: (type: BackupType) => backupApi.runNow(type),
  })
}

export function useRestorePostgresMutation() {
  return useMutation({
    meta: { invalidatesQuery: backupKeys.all },
    mutationFn: (input: PostgresRestoreRequest) =>
      backupApi.restorePostgres(input),
  })
}

export function useRestoreQdrantMutation() {
  return useMutation({
    meta: {
      invalidatesQuery: backupKeys.all,
      successMessage:
        "Đã bắt đầu khôi phục Qdrant. Theo dõi kết quả ở Lịch sử khôi phục.",
    },
    mutationFn: (backupRunId: string) => backupApi.restoreQdrant(backupRunId),
  })
}

export function runNowSuccessMessage(type: BackupType): string {
  return `Đã bắt đầu sao lưu ${BACKUP_TYPE_LABELS[type]}. Kết quả sẽ hiện trong vài phút.`
}
