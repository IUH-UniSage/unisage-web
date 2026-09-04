import { z } from "zod"

// unisage-agent (FastAPI/Pydantic) returns plain snake_case JSON, unlike
// backend-java's camelCase - these schemas keep the wire field names as-is
// rather than transforming to camelCase, so a `console.log` of a raw
// response and a schema-parsed value always look the same.

export const chunkingStrategyNameSchema = z.enum([
  "recursive",
  "token_based",
  "semantic",
  "markdown_aware",
  "excel_row",
])

export const regionTypeSchema = z.enum(["text", "table", "excel_row"])

export const chunkSchema = z.object({
  chunk_index: z.number().int().nonnegative(),
  content: z.string(),
  region_type: regionTypeSchema,
})

export const previewRequestSchema = z.object({
  department_id: z.string().min(1).max(100),
  object_key: z.string().min(1).max(1024),
})

export const previewResponseSchema = z.object({
  raw_text: z.string(),
})

export const chunkingRequestSchema = z.object({
  document_id: z.string().min(1).max(100),
  department_id: z.string().min(1).max(100),
  object_key: z.string().min(1).max(1024),
  strategy: chunkingStrategyNameSchema,
  params: z.record(z.string(), z.unknown()).default({}),
})

export const chunkingResponseSchema = z.object({
  chunks: z.array(chunkSchema),
})

export const embeddingRequestSchema = z.object({
  document_id: z.string().min(1).max(100),
  department_id: z.string().min(1).max(100),
  access_level: z.number().int().nonnegative(),
  object_key: z.string().min(1).max(1024),
  chunks: z.array(chunkSchema).min(1),
})

export const embeddingAcceptedResponseSchema = z.object({
  task_id: z.string(),
})

export const ingestionStepSchema = z.enum(["chunked", "embedding"])

export const ingestionJobResponseSchema = z.object({
  object_key: z.string(),
  current_step: ingestionStepSchema,
  chunking_strategy: chunkingStrategyNameSchema,
  chunking_params: z.record(z.string(), z.unknown()),
  chunks: z.array(chunkSchema),
  task_id: z.string().nullable(),
  // Present only while `current_step` is "embedding" - the live Celery task
  // progress, read server-side so the reconciliation sweep needs one call.
  task_state: z.string().nullable().optional(),
  task_percent: z.number().nullable().optional(),
})

// One frame from `WS /ingestion/events` (the broadcast progress/completion
// channel). The relay already filters frames to the caller's departments.
export const ingestionEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("progress"),
    task_id: z.string(),
    document_id: z.string(),
    department_id: z.string(),
    percent: z.number(),
  }),
  z.object({
    type: z.literal("completed"),
    task_id: z.string(),
    document_id: z.string(),
    department_id: z.string(),
    state: z.string(),
  }),
])

// Form-side schema for the chunking step's strategy-params inputs - mirrors
// exactly what app/rag/chunking/strategy.py's dispatch() reads per strategy
// (params.get("chunk_size", 800), etc.), not the wire ChunkingRequest shape
// (that one takes an already-built params: Record<string, unknown>).
export const chunkingFormSchema = z.object({
  chunkSize: z.number().int().positive().optional(),
  overlap: z.number().int().nonnegative().optional(),
  overlapRatio: z.number().min(0).max(1).optional(),
  rowsPerChunk: z.number().int().positive().optional(),
  similarityThreshold: z.number().min(0).max(1).optional(),
  strategy: chunkingStrategyNameSchema,
  targetTokens: z.number().int().positive().optional(),
})

export type ChunkingFormValues = z.infer<typeof chunkingFormSchema>

export type ChunkingStrategyName = z.infer<typeof chunkingStrategyNameSchema>
export type RegionType = z.infer<typeof regionTypeSchema>
export type Chunk = z.infer<typeof chunkSchema>
export type PreviewRequest = z.infer<typeof previewRequestSchema>
export type PreviewResponse = z.infer<typeof previewResponseSchema>
export type ChunkingRequest = z.infer<typeof chunkingRequestSchema>
export type ChunkingResponse = z.infer<typeof chunkingResponseSchema>
export type EmbeddingRequest = z.infer<typeof embeddingRequestSchema>
export type EmbeddingAcceptedResponse = z.infer<
  typeof embeddingAcceptedResponseSchema
>
export type IngestionStep = z.infer<typeof ingestionStepSchema>
export type IngestionJobResponse = z.infer<typeof ingestionJobResponseSchema>
export type IngestionEvent = z.infer<typeof ingestionEventSchema>
