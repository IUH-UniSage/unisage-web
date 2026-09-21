import { describe, expect, it } from "vitest"

import type { UsageLimitPlan } from "@/features/usage-limits/schemas/usage-limit-schemas"
import {
  getPlanKind,
  matchesPlanKind,
} from "@/features/usage-limits/utils/plan-kind"

const plan = (overrides: Partial<UsageLimitPlan>): UsageLimitPlan => ({
  dailyTokenLimit: 100,
  id: "11111111-1111-4111-8111-111111111111",
  isActive: true,
  isDefault: false,
  name: "Gói",
  weeklyTokenLimit: 500,
  ...overrides,
})

describe("getPlanKind", () => {
  it("labels the default plan first, even when it is also unlimited", () => {
    expect(
      getPlanKind(
        plan({ dailyTokenLimit: null, isDefault: true, weeklyTokenLimit: null })
      )
    ).toBe("default")
  })

  it("is unlimited only when both windows have no limit", () => {
    expect(
      getPlanKind(plan({ dailyTokenLimit: null, weeklyTokenLimit: null }))
    ).toBe("unlimited")
    expect(getPlanKind(plan({ dailyTokenLimit: null }))).toBe("limited")
  })
})

describe("matchesPlanKind", () => {
  it("matches everything for 'all'", () => {
    expect(matchesPlanKind(plan({}), "all")).toBe(true)
  })

  it("finds an unlimited default plan under both 'default' and 'unlimited'", () => {
    const unlimitedDefault = plan({
      dailyTokenLimit: null,
      isDefault: true,
      weeklyTokenLimit: null,
    })

    expect(matchesPlanKind(unlimitedDefault, "default")).toBe(true)
    expect(matchesPlanKind(unlimitedDefault, "unlimited")).toBe(true)
    expect(matchesPlanKind(unlimitedDefault, "limited")).toBe(false)
  })

  it("keeps limited plans out of 'unlimited'", () => {
    expect(matchesPlanKind(plan({}), "unlimited")).toBe(false)
    expect(matchesPlanKind(plan({}), "limited")).toBe(true)
  })
})
