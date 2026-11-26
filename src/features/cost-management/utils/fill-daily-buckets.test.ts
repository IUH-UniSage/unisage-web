import { describe, expect, it } from "vitest"

import {
  fillDailyBuckets,
  formatDayTick,
} from "@/features/cost-management/utils/fill-daily-buckets"

describe("fillDailyBuckets", () => {
  it("fills missing days between the first and last bucket with zero", () => {
    expect(
      fillDailyBuckets([
        { cost: 2, day: "2026-11-07" },
        { cost: 1, day: "2026-11-04" },
      ])
    ).toEqual([
      { cost: 1, day: "2026-11-04" },
      { cost: 0, day: "2026-11-05" },
      { cost: 0, day: "2026-11-06" },
      { cost: 2, day: "2026-11-07" },
    ])
  })

  it("crosses month boundaries", () => {
    expect(
      fillDailyBuckets([
        { cost: 1, day: "2026-10-31" },
        { cost: 1, day: "2026-11-01" },
      ]).map((point) => point.day)
    ).toEqual(["2026-10-31", "2026-11-01"])
  })

  it("leaves non-date keys untouched", () => {
    const points = [
      { cost: 1, day: "google" },
      { cost: 2, day: "openai" },
    ]
    expect(fillDailyBuckets(points)).toBe(points)
  })
})

describe("formatDayTick", () => {
  it("renders day/month", () => {
    expect(formatDayTick("2026-11-05")).toBe("05/11")
  })
})
