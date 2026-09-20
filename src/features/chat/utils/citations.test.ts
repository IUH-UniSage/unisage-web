import { describe, expect, it } from "vitest"

import type { Citation, Message } from "@/features/chat/schemas/chat-schemas"
import {
  groupCitationsByDocument,
  markerNumbers,
  latestCitations,
} from "@/features/chat/utils/citations"

const citation = (overrides: Partial<Citation>): Citation => ({
  documentId: "doc-1",
  index: 1,
  pageEnd: 4,
  pageStart: 3,
  section: "Mục 3",
  sourceType: "PDF",
  title: "Quyết định 1035",
  ...overrides,
})

describe("groupCitationsByDocument", () => {
  it("merges chunks of one document and joins their distinct pages", () => {
    const groups = groupCitationsByDocument([
      citation({ index: 1 }),
      citation({ index: 2, pageEnd: 6, pageStart: 6 }),
      citation({ index: 3 }),
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].first.index).toBe(1)
    expect(groups[0].indexes).toEqual([1, 2, 3])
    expect(groups[0].pages).toBe("tr. 3-4, 6")
  })

  it("keeps different documents apart and tolerates a missing page or documentId", () => {
    const groups = groupCitationsByDocument([
      citation({ index: 1 }),
      citation({
        documentId: null,
        index: 2,
        pageEnd: null,
        pageStart: null,
        title: "Quy chế A",
      }),
    ])

    expect(groups.map((group) => group.pages)).toEqual(["tr. 3-4", null])
  })
})

describe("groupCitationsByDocument ordering", () => {
  it("lists marker indexes ascending and pages by page number, not by citation order", () => {
    const [group] = groupCitationsByDocument([
      citation({ index: 4, pageEnd: 3, pageStart: 2 }),
      citation({ index: 2, pageEnd: 3, pageStart: 3 }),
    ])

    expect(group.indexes).toEqual([2, 4])
    expect(group.pages).toBe("tr. 2-3, 3")
  })
})

describe("markerNumbers", () => {
  it("numbers markers by document position so [2] and [4] of one document both read 1", () => {
    const groups = groupCitationsByDocument([
      citation({ index: 2 }),
      citation({ documentId: "doc-2", index: 3 }),
      citation({ index: 4 }),
    ])

    expect(markerNumbers(groups)).toEqual({ 2: 1, 3: 2, 4: 1 })
  })
})

describe("latestCitations", () => {
  const message = (role: Message["role"], citations: Citation[] | null) =>
    ({ citations, role }) as Message

  it("returns the newest assistant reply's citations, and none when it cites nothing", () => {
    const older = [citation({ title: "Cũ" })]
    const newer = [citation({ title: "Mới" })]

    expect(
      latestCitations([
        message("ASSISTANT", older),
        message("USER", null),
        message("ASSISTANT", newer),
        message("USER", null),
      ])
    ).toBe(newer)
    expect(
      latestCitations([
        message("ASSISTANT", older),
        message("USER", null),
        message("ASSISTANT", null),
      ])
    ).toEqual([])
  })

  it("is empty when nothing cites a source", () => {
    expect(latestCitations([message("ASSISTANT", null)])).toEqual([])
  })
})
