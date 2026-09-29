import type {
  ModelPriceChangeType,
  ModelPriceSource,
} from "@/features/cost-management/schemas/cost-management-schemas"

// Official pricing pages, linked for SA to cross-check a synced price by eye.
const PROVIDER_PRICING_URLS: Record<string, string> = {
  google: "https://ai.google.dev/gemini-api/docs/pricing",
  openai: "https://developers.openai.com/api/docs/pricing",
}

export function getProviderPricingUrl(provider: string): string | undefined {
  return PROVIDER_PRICING_URLS[provider.toLowerCase()]
}

const SOURCE_LABELS = {
  LITELLM: "LiteLLM",
  MANUAL: "Chỉnh tay",
} as const satisfies Record<ModelPriceSource, string>

export function getPriceSourceLabel(source: ModelPriceSource): string {
  return SOURCE_LABELS[source]
}

const CHANGE_TYPE_LABELS = {
  MANUAL_CREATE: "Thêm tay",
  MANUAL_RESET: "Khôi phục LiteLLM",
  MANUAL_UPDATE: "Chỉnh tay",
  SYNC_CREATE: "Đồng bộ (mới)",
  SYNC_UPDATE: "Đồng bộ (đổi giá)",
} as const satisfies Record<ModelPriceChangeType, string>

export function getPriceChangeTypeLabel(type: ModelPriceChangeType): string {
  return CHANGE_TYPE_LABELS[type]
}

export function priceKey(provider: string, modelName: string): string {
  return `${provider.trim().toLowerCase()}/${modelName.trim().toLowerCase()}`
}
