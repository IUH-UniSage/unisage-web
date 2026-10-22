import { describe, expect, it } from "vitest"

import {
  citedRate,
  describePeriod,
  findPeakBucket,
  formatBucketLabel,
  formatDuration,
  formatSignedPercent,
  percentChange,
} from "@/features/analytics/utils/dashboard-format"

describe("dashboard-format", () => {
  it("describes today from midnight and compares with yesterday", () => {
    expect(
      describePeriod({
        from: "2026-10-21T00:00:00",
        granularity: "HOUR",
        key: "TODAY",
        previousFrom: "2026-10-20T00:00:00",
        previousTo: "2026-10-20T15:37:12",
        to: "2026-10-21T15:37:12",
      })
    ).toBe("Từ 00:00 đến 15:37 · so với cùng giờ hôm qua")
  })

  it("describes a multi-day period by its local dates", () => {
    expect(
      describePeriod({
        from: "2026-10-15T00:00:00",
        granularity: "DAY",
        key: "LAST_7_DAYS",
        previousFrom: "2026-10-08T00:00:00",
        previousTo: "2026-10-14T15:37:00",
        to: "2026-10-21T15:37:00",
      })
    ).toBe("15/10 – 21/10, đến 15:37 · so với 7 ngày trước đó")
  })

  it("labels hourly and daily buckets", () => {
    expect(formatBucketLabel("2026-10-21T07:00:00", "HOUR")).toBe("07 giờ")
    expect(formatBucketLabel("2026-10-21T00:00:00", "DAY")).toBe("21/10")
  })

  it("has no percent change without a previous value", () => {
    expect(percentChange(5, 0)).toBeNull()
    expect(percentChange(25, 50)).toBe(-50)
  })

  it("computes the cited rate over answers that did not fail", () => {
    expect(
      citedRate({
        cited: 7,
        failed: 2,
        medianResponseMs: null,
        p95ResponseMs: null,
        total: 10,
      })
    ).toBe(87.5)
    expect(
      citedRate({
        cited: 0,
        failed: 3,
        medianResponseMs: null,
        p95ResponseMs: null,
        total: 3,
      })
    ).toBeNull()
  })

  it("formats durations and signed deltas", () => {
    expect(formatDuration(850)).toBe("850 ms")
    expect(formatDuration(2630)).toBe("2,6 giây")
    expect(formatSignedPercent(-24.44)).toBe("−24,4%")
    expect(formatSignedPercent(3, " điểm %")).toBe("+3 điểm %")
  })

  it("finds the busiest bucket, ignoring empty ones", () => {
    const quiet = { answered: 0, costUsd: 0, failed: 0, start: "a" }
    const busy = { answered: 3, costUsd: 0, failed: 1, start: "b" }
    expect(findPeakBucket([quiet, busy])).toBe(busy)
    expect(findPeakBucket([quiet])).toBeNull()
  })
})
