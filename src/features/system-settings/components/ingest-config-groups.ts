import type { SystemConfig } from "@/features/system-settings/schemas/system-config-schemas"

export type ConfigGroup = { configs: SystemConfig[]; title: string }

// Ordered strategy prefixes ("ingest.chunking.<strategy>.<field>") -> the
// card title, matching the ingestion wizard's own chunking-strategy step
// (src/features/ingestion/components/steps/chunking/strategy-config.ts)
// STRATEGIES order, so this settings page mirrors that UI's grouping.
const CHUNKING_STRATEGY_TITLES: [string, string][] = [
  ["recursive", "Đệ quy (mặc định)"],
  ["token_based", "Theo số token"],
  ["semantic", "Theo ngữ nghĩa"],
  ["markdown_aware", "Theo cấu trúc Markdown"],
  ["excel_row", "Theo dòng Excel"],
]

const CHUNKING_KEY_PATTERN = /^ingest\.chunking\.([a-z_]+)\./

/**
 * Splits the flat INGEST config list into "Cấu hình chung" (non-chunking
 * keys) plus one card per chunking strategy - 13 flat fields in one list
 * is too dense to scan, and this mirrors the ingestion wizard's own
 * per-strategy card layout the settings for it were sourced from.
 */
export function groupIngestConfigs(configs: SystemConfig[]): ConfigGroup[] {
  const general: SystemConfig[] = []
  const byStrategy = new Map<string, SystemConfig[]>()

  for (const config of configs) {
    const match = CHUNKING_KEY_PATTERN.exec(config.configKey)
    if (match) {
      const strategy = match[1]
      const bucket = byStrategy.get(strategy) ?? []
      bucket.push(config)
      byStrategy.set(strategy, bucket)
    } else {
      general.push(config)
    }
  }

  const groups: ConfigGroup[] = []
  if (general.length > 0) {
    groups.push({ configs: general, title: "Cấu hình chung" })
  }
  for (const [strategy, title] of CHUNKING_STRATEGY_TITLES) {
    const strategyConfigs = byStrategy.get(strategy)
    if (strategyConfigs && strategyConfigs.length > 0) {
      groups.push({ configs: strategyConfigs, title })
    }
  }
  return groups
}
