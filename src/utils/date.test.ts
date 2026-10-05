import { describe, expect, it } from "vitest"

import { formatDate, formatDateTime, parseApiDate } from "./date"
import { formatAuditDate } from "./date-format"

describe("parseApiDate", () => {
  it("reads an offset-less date-time as UTC", () => {
    expect(parseApiDate("2026-10-05T06:02:00")?.toISOString()).toBe(
      "2026-10-05T06:02:00.000Z"
    )
    expect(parseApiDate("2026-10-05T06:02:00.123456")?.toISOString()).toBe(
      "2026-10-05T06:02:00.123Z"
    )
  })

  it("keeps an explicit offset", () => {
    expect(parseApiDate("2026-10-05T06:02:00Z")?.toISOString()).toBe(
      "2026-10-05T06:02:00.000Z"
    )
    expect(parseApiDate("2026-10-05T13:02:00+07:00")?.toISOString()).toBe(
      "2026-10-05T06:02:00.000Z"
    )
  })

  it.each([null, undefined, "", "not a date"])("returns null for %j", (raw) => {
    expect(parseApiDate(raw)).toBeNull()
  })
})

describe("formatting in Vietnam time", () => {
  it("shows a UTC timestamp as Vietnam time, with or without Z", () => {
    expect(formatDateTime("2026-10-05T06:02:00Z")).toBe("13:02 05/10/2026")
    expect(formatDateTime("2026-10-05T06:02:00")).toBe("13:02 05/10/2026")
  })

  it("rolls the calendar day over at Vietnam midnight", () => {
    // 18:30 UTC is already 01:30 the next day in UTC+7.
    expect(formatDate("2026-10-05T18:30:00Z")).toBe("06/10/2026")
    expect(formatAuditDate("2026-10-05T18:30:00")).toBe("06/10/2026")
  })

  it("keeps a date-only value on its own day", () => {
    expect(formatDate("2026-10-05")).toBe("05/10/2026")
  })
})
