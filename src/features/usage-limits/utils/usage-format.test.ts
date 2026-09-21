import { describe, expect, it } from "vitest"

import type { UsageWindow } from "@/features/usage-limits/schemas/usage-limit-schemas"
import {
  formatTimeUntil,
  formatTokenLimit,
  isRunningLow,
} from "@/features/usage-limits/utils/usage-format"

const NOW = new Date("2026-09-21T03:00:00Z").getTime()
const at = (offsetMs: number) => new Date(NOW + offsetMs).toISOString()
const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe("formatTimeUntil", () => {
  it("shows minutes when under an hour", () => {
    expect(formatTimeUntil(at(24 * MIN), NOW)).toBe("24 phút")
  })

  it("shows hours and minutes", () => {
    expect(formatTimeUntil(at(2 * HOUR + 5 * MIN), NOW)).toBe("2 giờ 5 phút")
    expect(formatTimeUntil(at(2 * HOUR), NOW)).toBe("2 giờ")
  })

  it("shows days and hours", () => {
    expect(formatTimeUntil(at(3 * DAY + 4 * HOUR + 9 * MIN), NOW)).toBe(
      "3 ngày 4 giờ"
    )
    expect(formatTimeUntil(at(2 * DAY), NOW)).toBe("2 ngày")
  })

  it("never goes negative or shows zero minutes", () => {
    expect(formatTimeUntil(at(-5 * MIN), NOW)).toBe("dưới 1 phút")
    expect(formatTimeUntil(at(30 * 1000), NOW)).toBe("dưới 1 phút")
  })

  it("returns null for an unparsable time", () => {
    expect(formatTimeUntil("not-a-date", NOW)).toBeNull()
  })
})

describe("isRunningLow", () => {
  const active = (remainingPercent: number): UsageWindow => ({
    remainingPercent,
    resetAt: at(HOUR),
    status: "ACTIVE",
  })

  it("is true at 20% left or less (80% used or more)", () => {
    expect(isRunningLow(active(20))).toBe(true)
    expect(isRunningLow(active(0))).toBe(true)
  })

  it("is false above 20% left", () => {
    expect(isRunningLow(active(21))).toBe(false)
  })

  it("is false for idle and unlimited windows", () => {
    expect(isRunningLow({ remainingPercent: 100, status: "IDLE" })).toBe(false)
    expect(isRunningLow({ status: "UNLIMITED" })).toBe(false)
  })
})

describe("formatTokenLimit", () => {
  it("labels a null limit as unlimited", () => {
    expect(formatTokenLimit(null)).toBe("Không giới hạn")
    expect(formatTokenLimit(undefined)).toBe("Không giới hạn")
  })

  it("groups digits", () => {
    expect(formatTokenLimit(30000)).toMatch(/^30[.\s ,]000$/)
  })
})
