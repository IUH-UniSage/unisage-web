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

export const embeddingStatusResponseSchema = z.object({
  percent: z.number(),
  state: z.string(),
})

export const ingestionJobResponseSchema = z.object({
  object_key: z.string(),
  current_step: z.string(),
  chunking_strategy: z.string(),
  chunking_params: z.record(z.string(), z.unknown()),
  chunks: z.array(chunkSchema),
  task_id: z.string().nullable(),
})

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
export type EmbeddingStatusResponse = z.infer<
  typeof embeddingStatusResponseSchema
>
export type IngestionJobResponse = z.infer<typeof ingestionJobResponseSchema>
