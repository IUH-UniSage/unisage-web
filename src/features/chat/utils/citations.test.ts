import { describe, expect, it } from "vitest"

import type { Citation, Message } from "@/features/chat/schemas/chat-schemas"
import {
  distinctTitles,
  groupCitationsByDocument,
  markerNumbers,
  latestCitations,
  stripTrailingSourceLine,
  thinCitationMarkers,
  webCitationUrl,
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

const webCitation = (overrides: Partial<Citation>): Citation => ({
  documentId: null,
  index: 3,
  pageEnd: null,
  pageStart: null,
  section: null,
  sourceType: "WEB",
  title: "Lịch thi HK1",
  url: "https://www.pdt.iuh.edu.vn/lich-thi",
  ...overrides,
})

describe("web-search citations", () => {
  it("groups by url, shows the site and numbers after the documents", () => {
    const groups = groupCitationsByDocument([
      citation({ index: 1 }),
      webCitation({ index: 3 }),
      webCitation({ index: 4 }),
      webCitation({ index: 5, url: "https://ctsv.iuh.edu.vn/hoc-bong" }),
    ])

    expect(groups.map((group) => group.indexes)).toEqual([[1], [3, 4], [5]])
    expect(groups.map((group) => group.site)).toEqual([
      null,
      "pdt.iuh.edu.vn",
      "ctsv.iuh.edu.vn",
    ])
    expect(groups[1].pages).toBeNull()
    expect(markerNumbers(groups)).toEqual({ 1: 1, 3: 2, 4: 2, 5: 3 })
  })

  it("only treats a WEB citation with a url as a link", () => {
    expect(webCitationUrl(webCitation({}))).toBe(
      "https://www.pdt.iuh.edu.vn/lich-thi"
    )
    expect(webCitationUrl(webCitation({ url: null }))).toBeNull()
    expect(
      webCitationUrl(citation({ url: "https://pdt.iuh.edu.vn/x" }))
    ).toBeNull()
  })
})

describe("thinCitationMarkers", () => {
  const numbers = { 1: 1, 2: 1, 3: 2 }

  it("moves a list's shared sources onto the line that introduces it", () => {
    const content =
      "Các điều kiện như sau:\n\n- Ý một [1].\n- Ý hai [2].\n- Ý ba [1]."
    expect(thinCitationMarkers(content, numbers)).toBe(
      "Các điều kiện như sau [1, 2]:\n\n- Ý một.\n- Ý hai.\n- Ý ba."
    )
  })

  it("keeps each item's marker when nothing introduces the list", () => {
    const content = "- Ý một [1].\n- Ý hai [1]."
    expect(thinCitationMarkers(content, numbers)).toBe(content)
  })

  it("keeps markers when items cite different documents", () => {
    const content = "Gồm:\n- Ý một [1].\n- Ý hai [3]."
    expect(thinCitationMarkers(content, numbers)).toBe(content)
  })

  it("drops a repeated number within a line, keeping its last marker", () => {
    expect(thinCitationMarkers("Câu A [1], câu B [2] và C [3].", numbers)).toBe(
      "Câu A, câu B [2] và C [3]."
    )
  })

  it("leaves tables, plain paragraphs and links alone", () => {
    const content =
      "Đoạn một [1].\nĐoạn hai [1].\n| a | 1 [1] |\n| b | 2 [1] |\n[Xem](https://x.vn) [1]"
    expect(thinCitationMarkers(content, numbers)).toBe(content)
  })
})

describe("stripTrailingSourceLine", () => {
  it("drops a final model-written source line", () => {
    expect(
      stripTrailingSourceLine(
        "Trả lời [1].\n\n**Nguồn:** Quy chế đào tạo, tr. 3"
      )
    ).toBe("Trả lời [1].")
  })

  it("drops a source label with a list of documents under it", () => {
    expect(
      stripTrailingSourceLine(
        "Trả lời [1].\n\nNguồn tham khảo:\n- Quy chế đào tạo\n- Thông báo học phí"
      )
    ).toBe("Trả lời [1].")
  })

  it("drops a closing aside about where the answer came from", () => {
    expect(
      stripTrailingSourceLine(
        "- Ý một [1].\n\n*(Mọi mục trên được trích từ các bản mô tả chương trình đào tạo.)*"
      )
    ).toBe("- Ý một [1].")
  })

  it("keeps a last line that starts with the label but cites a source", () => {
    const content = "Có hai khoản.\nNguồn: quỹ học bổng của trường [1]."
    expect(stripTrailingSourceLine(content)).toBe(content)
  })

  it("keeps a sentence that only starts with the word", () => {
    const content = "Trả lời.\nNguồn gốc quy định là Bộ GD&ĐT [1]."
    expect(stripTrailingSourceLine(content)).toBe(content)
  })

  it("keeps the grounding note lines and ordinary asides", () => {
    const grounding = "Trả lời.\n\n> Nguồn của 930.000: [1]."
    expect(stripTrailingSourceLine(grounding)).toBe(grounding)
    const aside = "Trả lời [1].\n(Áp dụng từ học kỳ 1 năm 2026.)"
    expect(stripTrailingSourceLine(aside)).toBe(aside)
  })
})

describe("distinctTitles", () => {
  const group = (key: string, title: string) =>
    groupCitationsByDocument([
      citation({ documentId: key, index: 1, title }),
    ])[0]

  it("keeps what differs when titles start the same", () => {
    const groups = [
      group("a", "Bản mô tả chương trình đào tạo ngành Kỹ thuật phần mềm"),
      group("b", "Bản mô tả chương trình đào tạo ngành Khoa học máy tính"),
      group("c", "Quy chế đào tạo"),
    ]
    expect(distinctTitles(groups)).toEqual({
      a: "… ngành Kỹ thuật phần mềm",
      b: "… ngành Khoa học máy tính",
      c: "Quy chế đào tạo",
    })
  })
})
