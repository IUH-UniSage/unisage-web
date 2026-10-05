import { describe, expect, it } from "vitest"

import {
  parseFailureMessage,
  parseVerificationErrorMessage,
} from "./chat-model-formatters"

describe("parseVerificationErrorMessage", () => {
  it("parses Python ModelHTTPError string with status_code, model_name and body dict", () => {
    const rawError =
      "ModelHTTPError: status_code: 404, model_name: gemini-2.5-flash, body: {'error': {'code': 404, 'message': 'This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use models/gemini-3.8-flash for the latest features and improvements. We recommend you to use the Interactions API (https://ai.google.dev/gemini-api/docs/get-started).', 'status': 'NOT_FOUND'}}"

    const parsed = parseVerificationErrorMessage(rawError)

    expect(parsed.isParsed).toBe(true)
    expect(parsed.statusCode).toBe(404)
    expect(parsed.modelName).toBe("gemini-2.5-flash")
    expect(parsed.errorStatus).toBe("NOT_FOUND")
    expect(parsed.cleanMessage).toBe(
      "This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use models/gemini-3.8-flash for the latest features and improvements. We recommend you to use the Interactions API (https://ai.google.dev/gemini-api/docs/get-started)."
    )
  })

  it("parses JSON error string correctly", () => {
    const rawError = JSON.stringify({
      error: {
        code: 401,
        message: "Invalid API key provided",
        status: "UNAUTHENTICATED",
      },
    })

    const parsed = parseVerificationErrorMessage(rawError)

    expect(parsed.isParsed).toBe(true)
    expect(parsed.statusCode).toBe(401)
    expect(parsed.errorStatus).toBe("UNAUTHENTICATED")
    expect(parsed.cleanMessage).toBe("Invalid API key provided")
  })

  it("handles generic Python exception prefixes", () => {
    const rawError = "ValueError: Target URL could not be resolved"
    const parsed = parseVerificationErrorMessage(rawError)

    expect(parsed.isParsed).toBe(true)
    expect(parsed.cleanMessage).toBe("Target URL could not be resolved")
  })

  it("returns fallback for null or empty input", () => {
    expect(parseVerificationErrorMessage(null).cleanMessage).toBe("")
    expect(parseVerificationErrorMessage("   ").cleanMessage).toBe("")
  })
})

describe("parseFailureMessage", () => {
  it("splits the agent's friendly cause from the provider detail", () => {
    const raw =
      "Mô hình Trích xuất (gemini-3.1-flash-lite-preview): nhà cung cấp đang giới hạn tốc độ gọi (HTTP 429), thử lại sau ít phút. Chi tiết: ModelHTTPError: status_code: 429, model_name: gemini-3.1-flash-lite-preview, body: {'error': {'code': 429, 'message': 'You exceeded your current quota, please check your plan and billing details.', 'status': 'RESOURCE_EXHAUSTED'}}"

    const view = parseFailureMessage(raw)

    expect(view?.summary).toBe(
      "Mô hình Trích xuất (gemini-3.1-flash-lite-preview): nhà cung cấp đang giới hạn tốc độ gọi (HTTP 429), thử lại sau ít phút."
    )
    expect(view?.statusCode).toBe(429)
    expect(view?.errorStatus).toBe("RESOURCE_EXHAUSTED")
    expect(view?.modelName).toBe("gemini-3.1-flash-lite-preview")
    expect(view?.providerMessage).toBe(
      "You exceeded your current quota, please check your plan and billing details."
    )
    expect(view?.rawMessage).toBe(raw)
  })

  it("parses a message without the separator as a whole", () => {
    const view = parseFailureMessage("ValueError: Invalid API key")

    expect(view?.summary).toBe("Invalid API key")
    expect(view?.providerMessage).toBeUndefined()
  })

  it.each([null, undefined, "", "   "])("returns null for %j", (raw) => {
    expect(parseFailureMessage(raw)).toBeNull()
  })
})
