export type ModelPricing = {
  cachedInputPerMillion?: number
  inputPerMillion: number
  outputPerMillion?: number
}

// USD per 1M tokens, copied from LiteLLM's model_prices_and_context_window.json
// (the table the agent prices real calls with). Reference only - the agent's
// bundled LiteLLM version is what actually decides a line's cost.
export const MODEL_PRICING: Record<string, ModelPricing> = {
  "gemini-2.5-flash": {
    cachedInputPerMillion: 0.03,
    inputPerMillion: 0.3,
    outputPerMillion: 2.5,
  },
  "gemini-2.5-flash-lite": { inputPerMillion: 0.1, outputPerMillion: 0.4 },
  "gemini-2.5-pro": { inputPerMillion: 1.25, outputPerMillion: 10 },
  "gemini-embedding-001": { inputPerMillion: 0.15 },
  "gpt-4.1-mini": {
    cachedInputPerMillion: 0.1,
    inputPerMillion: 0.4,
    outputPerMillion: 1.6,
  },
  "gpt-4o": {
    cachedInputPerMillion: 1.25,
    inputPerMillion: 2.5,
    outputPerMillion: 10,
  },
  "gpt-4o-mini": {
    cachedInputPerMillion: 0.075,
    inputPerMillion: 0.15,
    outputPerMillion: 0.6,
  },
  "text-embedding-3-large": { inputPerMillion: 0.13 },
  "text-embedding-3-small": { inputPerMillion: 0.02 },
}

export function getModelPricing(modelName: string): ModelPricing | undefined {
  return MODEL_PRICING[modelName.trim().toLowerCase()]
}
