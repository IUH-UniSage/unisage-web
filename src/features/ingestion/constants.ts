import type { DocStatus } from "@/features/documents/schemas/document-schemas"

// A Celery task state counts as "finished" (SUCCESS or FAILURE). Used by
// the wizard progress view and by <DocumentStatusSync>.
export const TERMINAL_TASK_STATES: ReadonlySet<string> = new Set([
  "SUCCESS",
  "FAILURE",
])

export function isTerminalTaskState(state: string | undefined | null): boolean {
  return state != null && TERMINAL_TASK_STATES.has(state)
}

export type TerminalTaskState = "SUCCESS" | "FAILURE"

export type EmbeddingProgressState =
  "connecting" | "PROGRESS" | "SUCCESS" | "FAILURE" | "error"

export type EmbeddingProgress = {
  percent: number
  state: EmbeddingProgressState
}

export const EMBEDDING_CONNECTING: EmbeddingProgress = {
  percent: 0,
  state: "connecting",
}

// How a finished embed task maps onto the document's lifecycle status:
// SUCCESS removes the document from the Processing queue; FAILURE keeps it
// there so the user can retry.
export function terminalStateToDocStatus(state: TerminalTaskState): DocStatus {
  return state === "SUCCESS" ? "COMPLETED" : "FAILED"
}
