import type {
  ChunkingFormValues,
  ChunkingStrategyName,
} from "@/features/ingestion/schemas/ingestion-schemas"

// The default params each strategy sends when the user leaves an input
// untouched. Mirrors what app/rag/chunking/strategy.py's dispatch() reads
// (params.get("chunk_size", 800), ...). This one map feeds both
// `buildChunkingParams` and the form-field default/fallback values.
export const STRATEGY_DEFAULTS = {
  recursive: { chunk_size: 800, overlap: 120 },
  markdown_aware: { chunk_size: 800, overlap: 120 },
  token_based: { chunk_size: 400, overlap: 40 },
  semantic: {
    target_tokens: 400,
    overlap_ratio: 0.2,
    similarity_threshold: 0.5,
  },
  excel_row: { rows_per_chunk: 1 },
} as const satisfies Record<ChunkingStrategyName, Record<string, number>>

// The five strategies, in selector order, with their short button labels.
export const STRATEGIES: { id: ChunkingStrategyName; label: string }[] = [
  { id: "recursive", label: "ĐỆ QUY" },
  { id: "token_based", label: "TOKEN" },
  { id: "semantic", label: "NGỮ NGHĨA" },
  { id: "markdown_aware", label: "MARKDOWN" },
  { id: "excel_row", label: "EXCEL" },
]

export const STRATEGY_DESCRIPTIONS: Record<ChunkingStrategyName, string> = {
  excel_row: "Theo dòng Excel",
  markdown_aware: "Nhận diện Markdown",
  recursive: "Đệ quy (mặc định)",
  semantic: "Theo ngữ nghĩa",
  token_based: "Theo số token",
}

export function buildChunkingParams(
  values: ChunkingFormValues
): Record<string, unknown> {
  switch (values.strategy) {
    case "excel_row": {
      const d = STRATEGY_DEFAULTS.excel_row
      return { rows_per_chunk: values.rowsPerChunk ?? d.rows_per_chunk }
    }
    case "semantic": {
      const d = STRATEGY_DEFAULTS.semantic
      return {
        overlap_ratio: values.overlapRatio ?? d.overlap_ratio,
        similarity_threshold:
          values.similarityThreshold ?? d.similarity_threshold,
        target_tokens: values.targetTokens ?? d.target_tokens,
      }
    }
    case "token_based":
    case "recursive":
    case "markdown_aware": {
      const d = STRATEGY_DEFAULTS[values.strategy]
      return {
        chunk_size: values.chunkSize ?? d.chunk_size,
        overlap: values.overlap ?? d.overlap,
      }
    }
  }
}
