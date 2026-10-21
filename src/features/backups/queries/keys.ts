import type { BackupHistoryParams } from "@/features/backups/api/backup-api"

export const backupKeys = {
  all: ["backups"] as const,
  overview: () => [...backupKeys.all, "overview"] as const,
  postgresRestoreStatus: () =>
    [...backupKeys.all, "postgres-restore-status"] as const,
  restores: (params: BackupHistoryParams) =>
    [...backupKeys.all, "restores", params] as const,
  runFiles: (runId: string) => [...backupKeys.all, "run-files", runId] as const,
  runs: (params: BackupHistoryParams) =>
    [...backupKeys.all, "runs", params] as const,
}
