import { useUpdateDocumentStatusMutation } from "@/features/documents/queries/use-mutations"
import { useDeleteIngestionJobMutation } from "@/features/ingestion/queries/use-mutations"

export type TerminalEmbedState = "SUCCESS" | "FAILURE"

// Shared by every place that can observe an embed task reach a terminal
// state (the wizard's own WebSocket, the Processing queue's background
// poll): tell Java so Document.status leaves PENDING/PROCESSING (COMPLETED
// removes the document from the Processing queue entirely, FAILED keeps it
// there so the user can retry), and clear unisage-agent's ingestion job row
// so a future resume doesn't reconnect to a task whose result has already
// been consumed.
export function useReportEmbedCompletion() {
  const updateDocumentStatus = useUpdateDocumentStatusMutation()
  const deleteIngestionJob = useDeleteIngestionJobMutation()

  return (documentId: string, state: TerminalEmbedState) => {
    updateDocumentStatus.mutate({
      documentId,
      status: state === "SUCCESS" ? "COMPLETED" : "FAILED",
    })
    deleteIngestionJob.mutate(documentId)
  }
}
