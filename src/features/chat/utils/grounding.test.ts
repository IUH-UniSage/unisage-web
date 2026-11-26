import { describe, expect, it } from "vitest"

import { readGrounding } from "@/features/chat/utils/grounding"
import { buildMessage } from "@/test/fixtures/clarification"

const grounding = {
  miscited: [{ sources: [2], value: "930.000" }],
  schema_version: 1,
}

describe("readGrounding", () => {
  it("reads the findings of an assistant reply", () => {
    expect(readGrounding(buildMessage({ metadata: { grounding } }))).toEqual(
      grounding
    )
  })

  it("ignores a user message, malformed metadata and empty findings", () => {
    expect(
      readGrounding(buildMessage({ metadata: { grounding }, role: "USER" }))
    ).toBeNull()
    expect(
      readGrounding(
        buildMessage({ metadata: { grounding: { ungrounded: "1" } } })
      )
    ).toBeNull()
    expect(
      readGrounding(
        buildMessage({
          metadata: { grounding: { schema_version: 1, ungrounded: [] } },
        })
      )
    ).toBeNull()
    expect(readGrounding(buildMessage())).toBeNull()
  })
})
