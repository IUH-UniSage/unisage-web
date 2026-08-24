import { useEffect, useRef } from "react"

import { useReportEmbedCompletion } from "@/features/ingestion/hooks/use-report-embed-completion"
import {
  useEmbeddingStatusPollingQuery,
  useIngestionJobQuery,
} from "@/features/ingestion/queries/use-queries"

const TERMINAL_TASK_STATES = new Set(["SUCCESS", "FAILURE"])

/**
 * Detects one document's embed task finishing without a wizard page/
 * WebSocket open to observe it - mount one per document currently shown in
 * the Processing queue (see `useProcessingQueueCompletionWatchers`). Reads
 * the document's ingestion job to find an in-flight embed's task id, then
 * polls that task's status (via `useEmbeddingStatusPollingQuery`, which
 * stops itself once terminal) and reports completion the same way the
 * wizard's own WebSocket-driven path does.
 */
export function useEmbedCompletionWatcher(documentId: string): void {
  const jobQuery = useIngestionJobQuery(documentId)
  const job = jobQuery.data
  const isEmbedding = job?.current_step === "embedding" && Boolean(job.task_id)

  const statusQuery = useEmbeddingStatusPollingQuery(
    isEmbedding ? (job?.task_id ?? undefined) : undefined,
    isEmbedding
  )

  const reportEmbedCompletion = useReportEmbedCompletion()
  const hasReported = useRef(false)

  useEffect(() => {
    const state = statusQuery.data?.state
    if (hasReported.current || !state || !TERMINAL_TASK_STATES.has(state)) {
      return
    }

    hasReported.current = true
    reportEmbedCompletion(documentId, state as "SUCCESS" | "FAILURE")
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reportEmbedCompletion closes over useMutation results, not a reactive dependency; documentId is this hook's stable identity
  }, [statusQuery.data?.state])
}
