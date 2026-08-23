import { describe, expect, it } from "vitest"

import {
  chatModelPageSchema,
  createChatModelRequestSchema,
  updateChatModelRequestSchema,
} from "@/features/chat-models/schemas/chat-model-schemas"

const chatModel = {
  apiBaseUrl: "https://api.openai.com/v1",
  createdAt: "2026-07-28T08:00:00",
  createdBy: "system",
  errorCount: 0,
  hasApiKey: true,
  id: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
  isActive: true,
  lastErrorAt: null,
  llmModelName: "gpt-4o-mini",
  llmProvider: "openai",
  maxRpm: 60,
  modelSourceRef: null,
  priority: 1,
  sourceType: "CLOUD_API",
  updatedAt: null,
  updatedBy: null,
}

describe("chat-model schemas", () => {
  it("parses the backend ChatModelResponse page contract", () => {
    const page = chatModelPageSchema.parse({
      data: [chatModel],
      limit: 10,
      page: 1,
      totalItems: 1,
      totalPages: 1,
    })

    expect(page.data[0]?.llmModelName).toBe("gpt-4o-mini")
  })

  it("requires llmProvider and apiKey when creating a CLOUD_API model", () => {
    expect(() =>
      createChatModelRequestSchema.parse({
        apiBaseUrl: "https://api.openai.com/v1",
        llmModelName: "gpt-4o-mini",
        maxRpm: 60,
        sourceType: "CLOUD_API",
      })
    ).toThrow()
  })

  it("accepts a SELF_HOSTED model without llmProvider or apiKey", () => {
    const request = createChatModelRequestSchema.parse({
      apiBaseUrl: "http://localhost:8000/v1",
      llmModelName: "llama-3-8b",
      maxRpm: 30,
      modelSourceRef: "local-container",
      sourceType: "SELF_HOSTED",
    })

    expect(request.llmModelName).toBe("llama-3-8b")
  })

  it("allows an update with a blank apiKey (keep existing key)", () => {
    const request = updateChatModelRequestSchema.parse({
      apiBaseUrl: "https://api.openai.com/v1",
      llmModelName: "gpt-4o-mini",
      llmProvider: "openai",
      maxRpm: 60,
      sourceType: "CLOUD_API",
    })

    expect(request.apiKey).toBeUndefined()
  })
})
