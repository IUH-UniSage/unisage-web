import { CHAT_MODEL_PROVIDERS } from "@/features/chat-models/constants/chat-model-providers"
import type {
  ModelPrice,
  ModelSupportStatus,
} from "@/features/cost-management/schemas/cost-management-schemas"

export type ProviderSupport = {
  /** True when the model goes through the OpenAI-compatible endpoint, not a native SDK. */
  compatible: boolean
  provider: string
}

export type ModelSupport = {
  note?: string | null
  providers: ProviderSupport[]
  status: ModelSupportStatus
}

/**
 * Which chat-model providers can call a model, from its price row (backend
 * model-provider-support.yml). A registered model without a price row is at least callable
 * through the provider it was registered with.
 */
export function getModelSupport(
  provider: string,
  price: ModelPrice | undefined
): ModelSupport {
  if (!price) {
    return {
      providers: provider ? [{ compatible: false, provider }] : [],
      status: "inferred",
    }
  }
  return {
    note: price.supportNote,
    providers: price.supportedProviders.map((item) => ({
      compatible: item !== price.provider,
      provider: item,
    })),
    status: price.supportStatus,
  }
}

/** A row matches a provider filter when it is that provider's model or callable through it. */
export function matchesProviderFilter(
  provider: string,
  price: ModelPrice | undefined,
  filter: string
): boolean {
  return (
    provider === filter ||
    getModelSupport(provider, price).providers.some(
      (support) => support.provider === filter
    )
  )
}

/** Filter options: this project's providers first, then every other provider with a price. */
export function getProviderFilterOptions(priceProviders: string[]): string[] {
  const own = CHAT_MODEL_PROVIDERS.map((option) => option.value)
  const others = [...new Set(priceProviders)]
    .filter((provider) => !own.includes(provider))
    .sort((a, b) => a.localeCompare(b))
  return [...own, ...others]
}
