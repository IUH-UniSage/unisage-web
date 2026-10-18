import { z } from "zod"

// backend ErrorCode.EMBEDDING_REINDEX_REQUIRED: activating an EMBEDDING model
// whose vectors differ from the live index's.
export const EMBEDDING_REINDEX_REQUIRED_CODE = 2517

// Mirrors com.unisage.backend.entity.enums.EmbeddingReindexStatus.
export const embeddingReindexStatusSchema = z.enum([
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
])

export const embeddingReindexRunSchema = z.object({
  createdAt: z.string().nullish(),
  errorMessage: z.string().nullish(),
  failedPoints: z.number().int(),
  finishedAt: z.string().nullish(),
  id: z.uuid(),
  processedPoints: z.number().int(),
  sourceCollection: z.string(),
  startedAt: z.string().nullish(),
  status: embeddingReindexStatusSchema,
  targetCollection: z.string(),
  targetModel: z.object({
    displayName: z.string().nullish(),
    embeddingDimension: z.number().int().nullish(),
    id: z.uuid(),
    llmModelName: z.string(),
    llmProvider: z.string().nullish(),
  }),
  totalPoints: z.number().int().nullish(),
})

export const embeddingIndexSchema = z.object({
  activeCollection: z.string(),
  activeIdentity: z
    .object({
      dimension: z.number().int(),
      establishedAt: z.string().nullish(),
      modelName: z.string(),
      provider: z.string(),
    })
    .nullish(),
  activeModel: z
    .object({
      displayName: z.string().nullish(),
      id: z.uuid(),
      llmModelName: z.string(),
      llmProvider: z.string().nullish(),
    })
    .nullish(),
  baseCollection: z.string(),
  currentRun: embeddingReindexRunSchema.nullish(),
  lastRun: embeddingReindexRunSchema.nullish(),
})

export type EmbeddingReindexStatus = z.infer<
  typeof embeddingReindexStatusSchema
>
export type EmbeddingReindexRun = z.infer<typeof embeddingReindexRunSchema>
export type EmbeddingIndex = z.infer<typeof embeddingIndexSchema>

export function isOpenReindexRun(run: EmbeddingReindexRun | null | undefined) {
  return run?.status === "QUEUED" || run?.status === "RUNNING"
}
