import { describe, expect, it } from "vitest"

import {
  deriveOpenPanel,
  readAnsweredCard,
} from "@/features/chat/utils/clarification-state"
import {
  buildMessage,
  CONTRACT_ANSWERS,
  CONTRACT_PANEL,
} from "@/test/fixtures/clarification"

const openMetadata = {
  clarification: { panel: CONTRACT_PANEL, schema_version: 1, status: "open" },
}

describe("deriveOpenPanel", () => {
  it("opens the panel of a last COMPLETED assistant message with status open", () => {
    const assistant = buildMessage({ metadata: openMetadata })
    const messages = [buildMessage({ role: "USER" }), assistant]

    expect(deriveOpenPanel(messages)).toEqual({
      assistantMessageId: assistant.id,
      panel: CONTRACT_PANEL,
    })
  })

  it("stays closed for a cancelled panel", () => {
    const messages = [
      buildMessage({
        metadata: {
          clarification: { ...openMetadata.clarification, status: "cancelled" },
        },
      }),
    ]
    expect(deriveOpenPanel(messages)).toBeNull()
  })

  it("stays closed once a USER message follows the panel", () => {
    const messages = [
      buildMessage({ metadata: openMetadata }),
      buildMessage({ content: "Khoá: K20", role: "USER" }),
    ]
    expect(deriveOpenPanel(messages)).toBeNull()
  })

  it("stays closed for an ERROR or still-streaming assistant message", () => {
    expect(
      deriveOpenPanel([
        buildMessage({ metadata: openMetadata, status: "ERROR" }),
      ])
    ).toBeNull()
    expect(
      deriveOpenPanel([
        buildMessage({ metadata: openMetadata, status: "STREAMING" }),
      ])
    ).toBeNull()
  })

  it("treats malformed metadata as no panel", () => {
    const withExtraField = {
      clarification: { ...openMetadata.clarification, origin: "calculation" },
    }
    const withBadPanel = {
      clarification: {
        ...openMetadata.clarification,
        panel: { ...CONTRACT_PANEL, questions: [] },
      },
    }
    expect(
      deriveOpenPanel([buildMessage({ metadata: withExtraField })])
    ).toBeNull()
    expect(
      deriveOpenPanel([buildMessage({ metadata: withBadPanel })])
    ).toBeNull()
    expect(deriveOpenPanel([buildMessage()])).toBeNull()
    expect(deriveOpenPanel([])).toBeNull()
  })
})

describe("readAnsweredCard", () => {
  it("reads clarification_answers of a USER message", () => {
    const message = buildMessage({
      metadata: { clarification_answers: CONTRACT_ANSWERS },
      role: "USER",
    })
    expect(readAnsweredCard(message)).toEqual(CONTRACT_ANSWERS)
  })

  it("ignores assistant messages, plain USER messages and malformed payloads", () => {
    expect(
      readAnsweredCard(
        buildMessage({ metadata: { clarification_answers: CONTRACT_ANSWERS } })
      )
    ).toBeNull()
    expect(readAnsweredCard(buildMessage({ role: "USER" }))).toBeNull()
    expect(
      readAnsweredCard(
        buildMessage({
          metadata: {
            clarification_answers: { ...CONTRACT_ANSWERS, schema_version: 2 },
          },
          role: "USER",
        })
      )
    ).toBeNull()
  })
})
