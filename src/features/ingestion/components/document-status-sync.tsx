import { useEffect, useRef } from "react"

import { useUpdateDocumentStatusMutation } from "@/features/documents/queries/use-mutations"
import type { Document } from "@/features/documents/schemas/document-schemas"
import { ingestionApi } from "@/features/ingestion/api/ingestion-api"
import {
  isTerminalTaskState,
  terminalStateToDocStatus,
} from "@/features/ingestion/constants"
import { useIngestionEvents } from "@/features/ingestion/hooks/use-ingestion-events"

type DocumentStatusSyncProps = {
  documents: Document[]
  /** Called on each live "progress" frame for a document shown as PENDING. */
  onProgress?: (documentId: string, percent: number) => void
}

/**
 * Renders nothing. Mounts one subscription to the broadcast
 * `/ingestion/events` channel and, when a document currently shown as
 * PENDING has its embed task finish, persists the resulting
 * `Document.status` (COMPLETED / FAILED) via the normal mutation - whose
 * `meta.invalidatesQuery` refreshes every document list. Live "progress"
 * frames are forwarded to `onProgress` (if given) so a caller can render an
 * in-progress percentage without waiting for a terminal state.
 *
 * Because pub/sub is at-most-once, it also runs a one-shot reconciliation
 * sweep on mount and on every reconnect: it reads each PENDING document's
 * ingestion record (which carries the live `task_state` inline) and
 * reports any that already finished. That sweep - not the event - is the
 * authoritative path; a missed frame only delays the update to the next
 * mount/reconnect.
 */
export function DocumentStatusSync({
  documents,
  onProgress,
}: DocumentStatusSyncProps) {
  const updateStatus = useUpdateDocumentStatusMutation()
  const reportedRef = useRef<Set<string>>(new Set())

  const pendingIds = documents
    .filter((document) => document.status === "PENDING")
    .map((document) => document.id)
  const pendingKey = pendingIds.join(",")

  const report = (documentId: string, taskState: string) => {
    if (reportedRef.current.has(documentId)) return
    if (!isTerminalTaskState(taskState)) return
    reportedRef.current.add(documentId)
    updateStatus.mutate({
      documentId,
      status: terminalStateToDocStatus(
        taskState === "FAILURE" ? "FAILURE" : "SUCCESS"
      ),
    })
  }

  const { reconnectNonce } = useIngestionEvents((event) => {
    if (!pendingIds.includes(event.document_id)) return
    if (event.type === "progress") {
      onProgress?.(event.document_id, event.percent)
      return
    }
    report(event.document_id, event.state)
  })

  useEffect(() => {
    let cancelled = false

    for (const documentId of pendingIds) {
      if (reportedRef.current.has(documentId)) continue
      void ingestionApi
        .getJob(documentId)
        .then((job) => {
          if (cancelled || !job) return
          if (job.current_step === "embedding" && job.task_state) {
            report(documentId, job.task_state)
          }
        })
        .catch(() => {})
    }

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `report`/`pendingIds` are rebuilt every render; `pendingKey` + `reconnectNonce` are the real triggers
  }, [pendingKey, reconnectNonce])

  return null
}
