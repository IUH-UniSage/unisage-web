import chatModelProvidersJson from "@/features/chat-models/constants/chat-model-providers.json"
import type { ChatModelPurpose } from "@/features/chat-models/schemas/chat-model-schemas"

export type ChatModelProviderOption = {
  baseUrl: string
  label: string
  models: Record<ChatModelPurpose, string[]>
  value: string
}

// Mirrors ChatModelServiceImpl.SUPPORTED_LLM_PROVIDERS (backend-java) - keep
// both lists in sync when a provider is added/removed. `baseUrl` is each
// provider SDK's own public default endpoint, only used to prefill the form;
// the field stays editable since some accounts front it with a proxy.
// `models` are suggestions only (providers release new snapshots constantly),
// surfaced as autocomplete rather than a hard select - never used to reject
// a typed-in model name.
export const CHAT_MODEL_PROVIDERS =
  chatModelProvidersJson as ChatModelProviderOption[]

export function getChatModelProviderOption(
  value: string
): ChatModelProviderOption | undefined {
  return CHAT_MODEL_PROVIDERS.find((provider) => provider.value === value)
}

export function getChatModelSuggestions(
  provider: string | undefined,
  purpose: ChatModelPurpose
): string[] {
  if (!provider) return []
  return getChatModelProviderOption(provider)?.models[purpose] ?? []
}
