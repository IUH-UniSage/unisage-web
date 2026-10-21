import { describe, expect, it } from "vitest"

import {
  formatElapsed,
  formatResponseTime,
  progressLabel,
  shortUrl,
} from "@/features/chat/utils/turn-progress"

describe("formatElapsed", () => {
  it("shows tenths of a second with a decimal comma, rounded down", () => {
    expect(formatElapsed(0)).toBe("0,0s")
    expect(formatElapsed(3249)).toBe("3,2s")
    expect(formatElapsed(10_999)).toBe("10,9s")
    expect(formatElapsed(-5)).toBe("0,0s")
  })
})

describe("progressLabel", () => {
  it("names each stage of the contract", () => {
    expect(progressLabel({ stage: "analyzing" })).toBe("Đang phân tích")
    expect(progressLabel({ stage: "retrieving" })).toBe("Đang tìm thông tin")
    expect(progressLabel({ stage: "generating" })).toBe("Đang tạo câu trả lời")
    expect(progressLabel({ stage: "calculating" })).toBe("Đang tính toán")
    expect(progressLabel({ stage: "web_searching" })).toBe("Đang tìm kiếm web")
  })

  it("reads no status or an unknown stage as thinking", () => {
    expect(progressLabel(null)).toBe("Đang suy nghĩ")
    expect(progressLabel({ stage: "reranking_v2" })).toBe("Đang suy nghĩ")
  })

  it("names the web page being read", () => {
    expect(
      progressLabel({
        stage: "web_searching",
        url: "https://www.iuh.edu.vn/vi/thong-bao/hoc-phi-2026-2027.html",
      })
    ).toBe("Đang tìm kiếm trên iuh.edu.vn/vi/thong-bao/hoc-phi-2026-2027.html")
  })
})

describe("shortUrl", () => {
  it("decodes the path and drops www. and a trailing slash", () => {
    expect(shortUrl("https://pdt.iuh.edu.vn/th%C3%B4ng-b%C3%A1o/")).toBe(
      "pdt.iuh.edu.vn/thông-báo"
    )
    expect(shortUrl("not a url")).toBe("not a url")
  })
})

describe("formatResponseTime", () => {
  it("shows hundredths of a second with a decimal comma", () => {
    expect(formatResponseTime(16240)).toBe("16,24s")
    expect(formatResponseTime(400)).toBe("0,40s")
    expect(formatResponseTime(1955)).toBe("1,96s")
  })
})
