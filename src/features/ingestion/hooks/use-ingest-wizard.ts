import { useEffect, useRef, useState } from "react"

import type { Document } from "@/features/documents/schemas/document-schemas"
import { useEmbeddingProgress } from "@/features/ingestion/hooks/use-embedding-progress"
import { useReportEmbedCompletion } from "@/features/ingestion/hooks/use-report-embed-completion"
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

export function useIngestWizard(document: Document) {
  const jobQuery = useIngestionJobQuery(document.id)
  const previewMutation = usePreviewMutation()
  const chunkMutation = useChunkMutation()
  const embedMutation = useEmbedMutation()
  const reportEmbedCompletion = useReportEmbedCompletion()

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

  const embeddingProgress = useEmbeddingProgress(embeddingTaskId)
  const hasReportedTerminalStatus = useRef(false)

  // Once the embed task reaches a terminal state: tell Java so
  // Document.status leaves PENDING/PROCESSING (COMPLETED removes the
  // document from the Processing queue entirely, FAILED keeps it there so
  // the user can retry), and clear unisage-agent's ingestion job row so a
  // future resume doesn't reconnect to a task whose result has already been
  // consumed. Guarded to fire once per embed dispatch (WS can send the
  // terminal frame more than once before the socket closes).
  useEffect(() => {
    if (hasReportedTerminalStatus.current) return
    if (
      embeddingProgress.state !== "SUCCESS" &&
      embeddingProgress.state !== "FAILURE"
    ) {
      return
    }

    hasReportedTerminalStatus.current = true
    reportEmbedCompletion(document.id, embeddingProgress.state)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reportEmbedCompletion closes over useMutation results, not a reactive dependency; document.id is stable for the wizard's lifetime
  }, [embeddingProgress.state])

  // A document created without a department (a public, no-package document -
  // see Documents' "no docPackageId" case) has nothing for the trusted-context
  // department/access_level check to validate against - the wizard can't
  // proceed for it, so this is surfaced instead of silently sending
  // department_id: undefined to the AI agent.
  const missingDepartmentInfo =
    !document.departmentId || document.minAccessLevel == null

  if (!hasHydrated && !jobQuery.isFetching && !missingDepartmentInfo) {
    setHasHydrated(true)

    const job = jobQuery.data
    if (job) {
      setChunkingStrategy(job.chunking_strategy as ChunkingStrategyName)
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
    if (!document.departmentId || !document.sourceUrl) return

    previewMutation.mutate(
      {
        department_id: document.departmentId,
        object_key: document.sourceUrl,
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
    if (!document.departmentId || !document.sourceUrl) return

    setChunkingStrategy(strategy)
    setChunkingParams(params)

    chunkMutation.mutate(
      {
        department_id: document.departmentId,
        document_id: document.id,
        object_key: document.sourceUrl,
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
    if (
      !document.departmentId ||
      !document.sourceUrl ||
      document.minAccessLevel == null
    ) {
      return
    }

    embedMutation.mutate(
      {
        access_level: document.minAccessLevel,
        chunks,
        department_id: document.departmentId,
        document_id: document.id,
        object_key: document.sourceUrl,
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
