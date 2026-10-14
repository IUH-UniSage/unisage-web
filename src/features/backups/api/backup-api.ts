import { z } from "zod"

import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
  backupOverviewSchema,
  backupRunPageSchema,
  postgresRestoreStatusSchema,
  restoreRunPageSchema,
  restoreRunSchema,
  type BackupOverview,
  type BackupRunPage,
  type BackupType,
  type PostgresRestoreRequest,
  type PostgresRestoreStatus,
  type RestoreRun,
  type RestoreRunPage,
} from "@/features/backups/schemas/backup-schemas"
import { httpClient } from "@/lib/axios-client"
import { readApiResponse, readSuccessData } from "@/utils/api-response"
import type { ApiResponse } from "@/utils/api-response"

export type BackupHistoryParams = {
  // 1-based, like the rest of the UI.
  limit: number
  page: number
}

// While a Postgres restore has the database down, every request that needs
// the database (permission checks included) hangs until Hikari gives up.
// The status poll should fail fast instead and simply try again.
const RESTORE_POLL_TIMEOUT_MS = 8_000

export const backupApi = {
  async getOverview(): Promise<BackupOverview> {
    const response = await httpClient.get<ApiResponse<BackupOverview>>(
      API_ENDPOINTS.backups.overview,
      { timeout: RESTORE_POLL_TIMEOUT_MS }
    )

    return readSuccessData(response.data, backupOverviewSchema)
  },

  async getPostgresRestoreStatus(): Promise<PostgresRestoreStatus | null> {
    const response = await httpClient.get<ApiResponse<PostgresRestoreStatus>>(
      API_ENDPOINTS.backups.postgresRestoreStatus,
      { timeout: RESTORE_POLL_TIMEOUT_MS }
    )

    // null when no restore has ever run.
    return (
      readApiResponse(response.data, postgresRestoreStatusSchema).data ?? null
    )
  },

  async getRestores(params: BackupHistoryParams): Promise<RestoreRunPage> {
    const response = await httpClient.get<ApiResponse<RestoreRunPage>>(
      API_ENDPOINTS.backups.restores,
      { params: { page: params.page, size: params.limit } }
    )

    return readSuccessData(response.data, restoreRunPageSchema)
  },

  async getRuns(params: BackupHistoryParams): Promise<BackupRunPage> {
    const response = await httpClient.get<ApiResponse<BackupRunPage>>(
      API_ENDPOINTS.backups.runs,
      { params: { page: params.page, size: params.limit } }
    )

    return readSuccessData(response.data, backupRunPageSchema)
  },

  async restorePostgres(input: PostgresRestoreRequest): Promise<RestoreRun> {
    const response = await httpClient.post<ApiResponse<RestoreRun>>(
      API_ENDPOINTS.backups.postgresRestore,
      input
    )

    return readSuccessData(response.data, restoreRunSchema)
  },

  async restoreQdrant(backupRunId: string): Promise<RestoreRun> {
    const response = await httpClient.post<ApiResponse<RestoreRun>>(
      API_ENDPOINTS.backups.qdrantRestore,
      { backupRunId }
    )

    return readSuccessData(response.data, restoreRunSchema)
  },

  async runNow(type: BackupType): Promise<void> {
    const response = await httpClient.post<ApiResponse<null>>(
      API_ENDPOINTS.backups.runs,
      { type }
    )

    readApiResponse(response.data, z.unknown())
  },
}
