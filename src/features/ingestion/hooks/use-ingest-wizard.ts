import { useEffect, useRef, useState } from "react"

import { useUpdateDocumentStatusMutation } from "@/features/documents/queries/use-mutations"
import type { Document } from "@/features/documents/schemas/document-schemas"
import {
  EMBEDDING_CONNECTING,
  isTerminalTaskState,
  terminalStateToDocStatus,
  type EmbeddingProgress,
} from "@/features/ingestion/constants"
import { useIngestionEvents } from "@/features/ingestion/hooks/use-ingestion-events"
import {
  useChunkMutation,
  useEmbedMutation,
  usePreviewMutation,
} from "@/features/ingestion/queries/use-mutations"
import { useIngestionJobQuery } from "@/features/ingestion/queries/use-queries"
import type {
  Chunk,
  ChunkingStrategyName,
} from "@/features/ingestion/schemas/ingestion-schemas"

export type WizardStep = "preview" | "chunking" | "review" | "embedding"

const COMPLETED_PROGRESS: EmbeddingProgress = { percent: 100, state: "SUCCESS" }

export function useIngestWizard(document: Document) {
  const jobQuery = useIngestionJobQuery(document.id)
  const previewMutation = usePreviewMutation()
  const chunkMutation = useChunkMutation()
  const embedMutation = useEmbedMutation()
  const updateDocumentStatus = useUpdateDocumentStatusMutation()

  // A document already marked COMPLETED never needs the live channel or a
  // task-status read (an old task_id can read back as PENDING once the
  // Celery result TTL lapses) - the wizard just shows the done view.
  const alreadyComplete = document.status === "COMPLETED"

  const [step, setStep] = useState<WizardStep>("preview")
  const [previewText, setPreviewText] = useState<string>()
  const [chunks, setChunks] = useState<Chunk[]>([])
  const [chunkingStrategy, setChunkingStrategy] =
    useState<ChunkingStrategyName>("recursive")
  const [chunkingParams, setChunkingParams] = useState<Record<string, unknown>>(
    {}
  )
  const [embeddingTaskId, setEmbeddingTaskId] = useState<string>()

  // Resume: once the draft lookup resolves, decide the starting step exactly
  // once per wizard open - "adjusting state during render" (React docs),
  // not an effect, since setting several pieces of state from an async
  // query result inside useEffect would cascade an extra render. A job with
  // current_step "chunked" hydrates into review with the saved
  // chunks/strategy; "embedding" hydrates straight into the embedding step,
  // reconnecting the WebSocket via the saved task_id; a 404 (no job) starts
  // fresh at preview.
  //
  // Gated on `isFetching`, not `isPending`: this query is staleTime: 0 (see
  // ingestionOptions.job) specifically so a reopen always refetches instead
  // of trusting a leftover cached snapshot - but `isPending` only means "no
  // data yet", so a previously-cached-then-stale result (e.g. "no draft"
  // from before the user chunked) would satisfy `!isPending` immediately
  // and hydrate off it before the guaranteed background refetch resolves.
  // `isFetching` covers both the first-ever fetch and that background
  // refetch, so hydration actually waits for confirmed-fresh data.
  const [hasHydrated, setHasHydrated] = useState(false)
  const hasAutoStartedPreview = useRef(false)

  const [embeddingProgress, setEmbeddingProgress] = useState<EmbeddingProgress>(
    alreadyComplete ? COMPLETED_PROGRESS : EMBEDDING_CONNECTING
  )
  const hasReportedTerminalStatus = useRef(alreadyComplete)

  // Live progress for this wizard's own embed task, off the shared
  // `/ingestion/events` channel. Only connect while actually on the
  // embedding step and not resuming a finished document.
  useIngestionEvents(
    (event) => {
      if (event.task_id !== embeddingTaskId) return
      setEmbeddingProgress(
        event.type === "progress"
          ? { percent: event.percent, state: "PROGRESS" }
          : {
              percent: 100,
              state: event.state === "FAILURE" ? "FAILURE" : "SUCCESS",
            }
      )
    },
    { enabled: step === "embedding" && !alreadyComplete }
  )

  // Once the embed task reaches a terminal state, tell Java so
  // Document.status leaves PENDING (COMPLETED removes the document from the
  // Processing queue; FAILED keeps it there so the user can retry). Guarded
  // to fire once per embed dispatch (a terminal frame can arrive more than
  // once before the socket closes).
  useEffect(() => {
    if (hasReportedTerminalStatus.current) return
    if (!isTerminalTaskState(embeddingProgress.state)) return

    hasReportedTerminalStatus.current = true
    updateDocumentStatus.mutate({
      documentId: document.id,
      status: terminalStateToDocStatus(
        embeddingProgress.state === "FAILURE" ? "FAILURE" : "SUCCESS"
      ),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateDocumentStatus closes over useMutation results, not a reactive dependency; document.id is stable for the wizard's lifetime
  }, [embeddingProgress.state])

  // A document created without a department (a public, no-package document -
  // see Documents' "no docPackageId" case) has nothing for the trusted-context
  // department/access_level check to validate against - the wizard can't
  // proceed for it, so this is surfaced instead of silently sending
  // department_id: undefined to the AI agent.
  const missingDepartmentInfo =
    !document.departmentId || document.minAccessLevel == null

  // The document fields every step needs, narrowed to non-null once. The
  // wizard UI already blocks on `missingDepartmentInfo`, so in practice
  // this is non-null whenever a step action can run.
  const processCtx =
    document.departmentId != null &&
    document.sourceUrl != null &&
    document.minAccessLevel != null
      ? {
          departmentId: document.departmentId,
          sourceUrl: document.sourceUrl,
          accessLevel: document.minAccessLevel,
        }
      : null

  if (!hasHydrated && !jobQuery.isFetching && !missingDepartmentInfo) {
    setHasHydrated(true)

    const job = jobQuery.data
    if (alreadyComplete) {
      setStep("embedding")
      if (job) setChunks(job.chunks)
    } else if (job) {
      setChunkingStrategy(job.chunking_strategy)
      setChunkingParams(job.chunking_params)
      setChunks(job.chunks)
      if (job.current_step === "embedding" && job.task_id) {
        setEmbeddingTaskId(job.task_id)
        setStep("embedding")
      } else {
        setStep("review")
      }
    }
  }

  const runPreview = () => {
    if (!processCtx) return

    previewMutation.mutate(
      {
        department_id: processCtx.departmentId,
        object_key: processCtx.sourceUrl,
      },
      {
        onSuccess: (response) => {
          setPreviewText(response.raw_text)
        },
      }
    )
  }

  // Auto-start preview once we know we're starting fresh (post-hydration,
  // not resuming into review).
  useEffect(() => {
    if (
      hasHydrated &&
      step === "preview" &&
      !hasAutoStartedPreview.current &&
      !previewMutation.isPending &&
      !previewMutation.isSuccess
    ) {
      hasAutoStartedPreview.current = true
      runPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runPreview closes over mutable mutation state intentionally re-read via refs above, not tracked as a dependency
  }, [step, hasHydrated])

  const goToChunking = () => setStep("chunking")

  const runChunk = (
    strategy: ChunkingStrategyName,
    params: Record<string, unknown>
  ) => {
    if (!processCtx) return

    setChunkingStrategy(strategy)
    setChunkingParams(params)

    chunkMutation.mutate(
      {
        department_id: processCtx.departmentId,
        document_id: document.id,
        object_key: processCtx.sourceUrl,
        params,
        strategy,
      },
      {
        onSuccess: (response) => {
          setChunks(response.chunks)
          setStep("review")
        },
      }
    )
  }

  const updateChunkContent = (chunkIndex: number, content: string) => {
    setChunks((current) =>
      current.map((chunk) =>
        chunk.chunk_index === chunkIndex ? { ...chunk, content } : chunk
      )
    )
  }

  const runEmbed = () => {
    if (!processCtx) return

    embedMutation.mutate(
      {
        access_level: processCtx.accessLevel,
        chunks,
        department_id: processCtx.departmentId,
        document_id: document.id,
        object_key: processCtx.sourceUrl,
      },
      {
        onSuccess: (response) => {
          setEmbeddingTaskId(response.task_id)
          setStep("embedding")
        },
      }
    )
  }

  return {
    chunkingParams,
    chunkingStrategy,
    chunkMutation,
    chunks,
    embeddingProgress,
    embedMutation,
    goToChunking,
    // Not jobQuery.isPending/isFetching directly: once hydration has run
    // once, a later background refetch of this staleTime: 0 query (e.g. on
    // window refocus) must not blank the in-progress wizard back to this
    // "resuming" placeholder - local wizard state is the source of truth
    // for display after the one-shot hydration decision above.
    isResuming: !hasHydrated,
    missingDepartmentInfo,
    previewMutation,
    previewText,
    runChunk,
    runEmbed,
    runPreview,
    step,
    updateChunkContent,
  }
}
