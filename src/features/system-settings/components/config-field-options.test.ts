import { describe, expect, it } from "vitest"

import { getConfigOptions } from "@/features/system-settings/components/config-field-options"

const values = (key: string, current: string) =>
  getConfigOptions(key, current)?.map((option) => option.value)

describe("getConfigOptions", () => {
  it("offers every frequency for Differential and Qdrant", () => {
    expect(
      values("maintenance.backup.differential.frequency", "DAILY")
    ).toEqual(["OFF", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    expect(values("maintenance.backup.qdrant.frequency", "OFF")).toContain(
      "OFF"
    )
  })

  it("never offers OFF for the Full backup", () => {
    expect(values("maintenance.backup.full.frequency", "WEEKLY")).not.toContain(
      "OFF"
    )
  })

  it("offers half-hour times for the time keys", () => {
    const times = values("maintenance.backup.full.time", "02:00")
    expect(times).toHaveLength(48)
    expect(times?.slice(0, 3)).toEqual(["00:00", "00:30", "01:00"])
    expect(times?.at(-1)).toBe("23:30")
  })

  it("keeps a saved value that is not in the list, in order", () => {
    const times = values("maintenance.backup.full.time", "02:15")
    expect(times).toHaveLength(49)
    expect(times?.slice(4, 7)).toEqual(["02:00", "02:15", "02:30"])
  })

  it("returns null for free-text configs", () => {
    expect(getConfigOptions("chat.system_prompt", "anything")).toBeNull()
  })
})
