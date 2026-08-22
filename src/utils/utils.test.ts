import { describe, expect, it } from "vitest"

import { formatDate } from "@/utils/date"
import { formatFileSize } from "@/utils/file-size"
import { generateId } from "@/utils/uuid"

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(0)).toBe("0 B")
    expect(formatFileSize(512)).toBe("512 B")
  })

  it("formats larger units", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB")
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB")
  })
})

describe("formatDate", () => {
  it("formats a valid date", () => {
    expect(formatDate(new Date(2024, 0, 15))).toBe("Jan 15, 2024")
  })

  it("returns an empty string for an invalid date", () => {
    expect(formatDate("not-a-date")).toBe("")
  })
})

describe("generateId", () => {
  it("generates unique ids", () => {
    const first = generateId()
    const second = generateId()
    expect(first).not.toBe(second)
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })
})
