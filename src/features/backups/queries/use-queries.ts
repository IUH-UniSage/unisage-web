import { useQuery } from "@tanstack/react-query"

import type { BackupHistoryParams } from "@/features/backups/api/backup-api"
import { backupOptions } from "@/features/backups/queries/options"

export function useBackupOverviewQuery() {
  return useQuery(backupOptions.overview())
}

export function usePostgresRestoreStatusQuery(enabled: boolean) {
  return useQuery(backupOptions.postgresRestoreStatus(enabled))
}

export function useBackupRunsQuery(params: BackupHistoryParams) {
  return useQuery(backupOptions.runs(params))
}

export function useBackupRunFilesQuery(runId: string) {
  return useQuery(backupOptions.runFiles(runId))
}

export function useRestoreRunsQuery(params: BackupHistoryParams) {
  return useQuery(backupOptions.restores(params))
}
