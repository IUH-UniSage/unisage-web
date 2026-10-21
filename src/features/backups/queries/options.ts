import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import {
  backupApi,
  type BackupHistoryParams,
} from "@/features/backups/api/backup-api"
import { backupKeys } from "@/features/backups/queries/keys"
import type { BackupOverview } from "@/features/backups/schemas/backup-schemas"

// Backups and restores run in the background on the server; the page polls
// fast while one is running and slowly otherwise, so a scheduled run that
// starts while the page is open still shows up.
const ACTIVE_REFETCH_INTERVAL_MS = 3_000
const IDLE_REFETCH_INTERVAL_MS = 60_000

export function isBackupWorkRunning(overview: BackupOverview | undefined) {
  if (!overview) return false
  return (
    overview.busy ||
    Boolean(overview.postgresRestore?.active) ||
    overview.latestRuns.some((run) => run.status === "RUNNING")
  )
}

export const backupOptions = {
  overview: () =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      meta: { suppressGlobalError: true },
      queryFn: () => backupApi.getOverview(),
      queryKey: backupKeys.overview(),
      // Keep polling through failures: during a Postgres restore the
      // backend cannot answer until the database is back.
      refetchInterval: (query) =>
        query.state.status === "error" || isBackupWorkRunning(query.state.data)
          ? ACTIVE_REFETCH_INTERVAL_MS
          : IDLE_REFETCH_INTERVAL_MS,
      retry: false,
    }),

  // Only enabled while a Postgres restore is being followed (see
  // usePostgresRestoreTracking): the answer comes from the restore folder,
  // not the database, and asking it is also what lets the backend finish
  // the restore as soon as Postgres is back.
  postgresRestoreStatus: (enabled: boolean) =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      enabled,
      meta: { suppressGlobalError: true },
      queryFn: () => backupApi.getPostgresRestoreStatus(),
      queryKey: backupKeys.postgresRestoreStatus(),
      refetchInterval: enabled ? ACTIVE_REFETCH_INTERVAL_MS : false,
      retry: false,
    }),

  restores: (params: BackupHistoryParams) =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      placeholderData: keepPreviousData,
      queryFn: () => backupApi.getRestores(params),
      queryKey: backupKeys.restores(params),
    }),

  // Presigned links expire, so the list is fetched again each time the
  // dialog opens rather than served from an old cache entry.
  runFiles: (runId: string) =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      queryFn: () => backupApi.getRunFiles(runId),
      queryKey: backupKeys.runFiles(runId),
    }),

  runs: (params: BackupHistoryParams) =>
    queryOptions({
      ...QUERY_POLICIES.realtime,
      placeholderData: keepPreviousData,
      queryFn: () => backupApi.getRuns(params),
      queryKey: backupKeys.runs(params),
    }),
}
