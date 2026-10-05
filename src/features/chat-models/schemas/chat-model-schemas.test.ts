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
  displayName: null,
  errorCount: 0,
  hasApiKey: true,
  hasPendingChange: false,
  id: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
  isActive: true,
  lastErrorAt: null,
  lastErrorCode: null,
  latestVerification: {
    attempt: 1,
    createdAt: "2026-07-28T07:59:00",
    errorCode: null,
    errorMessage: null,
    errorType: null,
    finishedAt: "2026-07-28T08:00:00",
    id: "b76398bd-c8ac-4fa8-803e-0a91e207347c",
    status: "SUCCEEDED",
  },
  llmModelName: "gpt-4o-mini",
  llmProvider: "openai",
  maxRpm: 60,
  modelPurpose: "CHAT",
  modelSourceRef: null,
  priority: 1,
  revision: 1,
  sourceType: "CLOUD_API",
  status: "ACTIVE",
  updatedAt: null,
  updatedBy: null,
  verifiedAt: "2026-07-28T08:00:00",
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
    expect(page.data[0]?.latestVerification?.status).toBe("SUCCEEDED")
  })

  it("parses a row with an unrecognized verification status without throwing", () => {
    const page = chatModelPageSchema.parse({
      data: [
        {
          ...chatModel,
          latestVerification: {
            ...chatModel.latestVerification,
            status: "SOMETHING_NEW",
          },
        },
      ],
      limit: 10,
      page: 1,
      totalItems: 1,
      totalPages: 1,
    })

    expect(page.data[0]?.latestVerification?.status).toBe("SOMETHING_NEW")
  })

  it("requires modelPurpose, llmProvider and apiKey when creating a CLOUD_API model", () => {
    expect(() =>
      createChatModelRequestSchema.parse({
        apiBaseUrl: "https://api.openai.com/v1",
        llmModelName: "gpt-4o-mini",
        maxRpm: 60,
        sourceType: "CLOUD_API",
      })
    ).toThrow()

    expect(() =>
      createChatModelRequestSchema.parse({
        apiBaseUrl: "https://api.openai.com/v1",
        apiKey: "sk-test",
        llmModelName: "gpt-4o-mini",
        llmProvider: "openai",
        maxRpm: 60,
        modelPurpose: "CHAT",
        sourceType: "CLOUD_API",
      })
    ).not.toThrow()
  })

  it("accepts a SELF_HOSTED model without llmProvider or apiKey", () => {
    const request = createChatModelRequestSchema.parse({
      apiBaseUrl: "http://localhost:8000/v1",
      llmModelName: "llama-3-8b",
      maxRpm: 30,
      modelPurpose: "EMBEDDING",
      modelSourceRef: "local-container",
      sourceType: "SELF_HOSTED",
    })

    expect(request.llmModelName).toBe("llama-3-8b")
  })

  it("allows an update with a blank apiKey (keep existing key) and no modelPurpose field", () => {
    const request = updateChatModelRequestSchema.parse({
      apiBaseUrl: "https://api.openai.com/v1",
      llmModelName: "gpt-4o-mini",
      llmProvider: "openai",
      maxRpm: 60,
      sourceType: "CLOUD_API",
    })

    expect(request.apiKey).toBeUndefined()
    expect("modelPurpose" in request).toBe(false)
  })
})
