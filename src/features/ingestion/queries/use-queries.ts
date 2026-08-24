import { useQuery } from "@tanstack/react-query"

import { ingestionOptions } from "@/features/ingestion/queries/options"

const TERMINAL_TASK_STATES = new Set(["SUCCESS", "FAILURE"])
const EMBEDDING_STATUS_POLL_INTERVAL_MS = 4000

export function useIngestionJobQuery(documentId: string | undefined) {
  return useQuery({
    ...ingestionOptions.job(documentId ?? ""),
    enabled: Boolean(documentId),
  })
}

// Polls a dispatched embed task's status until it reaches a terminal state,
// then stops - used by the Processing queue to detect completion without a
// WebSocket/wizard page open. `enabled` gates it to documents actually known
// to have an in-flight embed (current_step "embedding").
export function useEmbeddingStatusPollingQuery(
  taskId: string | undefined,
  enabled: boolean
) {
  return useQuery({
    ...ingestionOptions.embeddingStatus(taskId ?? ""),
    enabled: Boolean(taskId) && enabled,
    refetchInterval: (query) =>
      query.state.data && TERMINAL_TASK_STATES.has(query.state.data.state)
        ? false
        : EMBEDDING_STATUS_POLL_INTERVAL_MS,
  })
}
