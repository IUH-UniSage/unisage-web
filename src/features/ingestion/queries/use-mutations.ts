import { useMutation } from "@tanstack/react-query"

import { ingestionApi } from "@/features/ingestion/api/ingestion-api"
import type {
  ChunkingRequest,
  EmbeddingRequest,
  PreviewRequest,
} from "@/features/ingestion/schemas/ingestion-schemas"

// preview/chunk are intermediate wizard steps, not an independent action the
// user submits and then leaves the page after - no invalidatesQuery/
// successMessage toast, and the global mutationCache error toast is
// suppressed since the wizard shows the AI-mapped Vietnamese message
// (getAiErrorMessage) inline itself; a generic English-fallback toast on top
// of that would contradict it. embed is the actual end-of-flow action a user
// completes, so it keeps the success toast.

export function usePreviewMutation() {
  return useMutation({
    meta: { suppressGlobalError: true },
    mutationFn: (input: PreviewRequest) => ingestionApi.preview(input),
  })
}

export function useChunkMutation() {
  return useMutation({
    meta: { suppressGlobalError: true },
    mutationFn: (input: ChunkingRequest) => ingestionApi.chunk(input),
  })
}

export function useEmbedMutation() {
  return useMutation({
    meta: {
      successMessage: "Đã bắt đầu embedding.",
      suppressGlobalError: true,
    },
    mutationFn: (input: EmbeddingRequest) => ingestionApi.embed(input),
  })
}
