import { useQuery } from "@tanstack/react-query"

import { STRATEGY_DEFAULTS } from "@/features/ingestion/components/steps/chunking/strategy-config"
import { systemConfigOptions } from "@/features/system-settings/queries/options"
import type { SystemConfig } from "@/features/system-settings/schemas/system-config-schemas"

export type ChunkingDefaults = typeof STRATEGY_DEFAULTS

// configKey -> [strategy, field] into STRATEGY_DEFAULTS' shape.
const CONFIG_KEY_MAP: Record<string, [keyof ChunkingDefaults, string]> = {
  "ingest.chunking.excel_row.rows_per_chunk": ["excel_row", "rows_per_chunk"],
  "ingest.chunking.markdown_aware.chunk_size": ["markdown_aware", "chunk_size"],
  "ingest.chunking.markdown_aware.overlap": ["markdown_aware", "overlap"],
  "ingest.chunking.recursive.chunk_size": ["recursive", "chunk_size"],
  "ingest.chunking.recursive.overlap": ["recursive", "overlap"],
  "ingest.chunking.semantic.overlap_ratio": ["semantic", "overlap_ratio"],
  "ingest.chunking.semantic.similarity_threshold": [
    "semantic",
    "similarity_threshold",
  ],
  "ingest.chunking.semantic.target_tokens": ["semantic", "target_tokens"],
  "ingest.chunking.token_based.chunk_size": ["token_based", "chunk_size"],
  "ingest.chunking.token_based.overlap": ["token_based", "overlap"],
}

/**
 * Merges `ingest.chunking.*` rows from GET /system-configs onto the hardcoded
 * STRATEGY_DEFAULTS - field by field, so a missing/unparseable single row
 * falls back to its own hardcoded value instead of discarding every default.
 */
function mergeChunkingDefaults(rows: SystemConfig[]): ChunkingDefaults {
  // Structured clone would be cleaner, but this object is only ever numbers -
  // a JSON round-trip is a cheap, dependency-free deep copy.
  const merged: ChunkingDefaults = JSON.parse(JSON.stringify(STRATEGY_DEFAULTS))

  for (const row of rows) {
    const mapping = CONFIG_KEY_MAP[row.configKey]
    if (!mapping) continue

    const parsed = Number(row.value)
    if (Number.isNaN(parsed)) continue

    const [strategy, field] = mapping
    ;(merged[strategy] as Record<string, number>)[field] = parsed
  }

  return merged
}

/**
 * Reads the ingestion wizard's chunking-strategy defaults from the backend
 * (unisage-backend UNISAGE-64) instead of only the hardcoded
 * STRATEGY_DEFAULTS constant, so an admin-edited default takes effect on the
 * next ingestion job. Falls back to STRATEGY_DEFAULTS entirely while loading
 * or if the request fails (e.g. offline, or a role without
 * SYSTEM_CONFIG_READ) - the wizard must never be blocked by this.
 */
export function useChunkingDefaults(): ChunkingDefaults {
  const { data } = useQuery({
    ...systemConfigOptions.list(),
    retry: false,
    throwOnError: false,
  })

  if (!data) return STRATEGY_DEFAULTS
  return mergeChunkingDefaults(data)
}
