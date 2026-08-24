import type { Document } from "@/features/documents/schemas/document-schemas"
import { useEmbedCompletionWatcher } from "@/features/ingestion/hooks/use-embed-completion-watcher"

function EmbedCompletionWatcher({ documentId }: { documentId: string }) {
  useEmbedCompletionWatcher(documentId)
  return null
}

type EmbedCompletionWatchersProps = {
  documents: Document[]
}

// Renders nothing - mounts one background watcher per PENDING document
// (the only status an in-flight embed leaves a document at) currently shown
// in the Processing queue, so Document.status still gets updated once an
// embed finishes even if nobody has that document's wizard page open to
// observe its WebSocket directly.
export function EmbedCompletionWatchers({
  documents,
}: EmbedCompletionWatchersProps) {
  return (
    <>
      {documents
        .filter((document) => document.status === "PENDING")
        .map((document) => (
          <EmbedCompletionWatcher documentId={document.id} key={document.id} />
        ))}
    </>
  )
}
