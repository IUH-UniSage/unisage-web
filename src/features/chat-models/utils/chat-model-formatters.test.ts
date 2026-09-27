import { describe, expect, it } from "vitest"

import { parseVerificationErrorMessage } from "./chat-model-formatters"

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
