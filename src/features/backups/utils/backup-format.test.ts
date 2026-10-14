import { describe, expect, it } from "vitest"

import type { BackupRun } from "@/features/backups/schemas/backup-schemas"
import {
  describeRestorePoint,
  isRestoreConfirmed,
  toVietnamInputValue,
  vietnamInputToUtc,
} from "@/features/backups/utils/backup-format"

describe("restore time picker", () => {
  it("shows an API timestamp in Vietnam time", () => {
    expect(toVietnamInputValue("2026-10-13T20:30:00Z")).toBe("2026-10-14T03:30")
    // Offset-less timestamps are UTC too.
    expect(toVietnamInputValue("2026-10-13T20:30:00")).toBe("2026-10-14T03:30")
    expect(toVietnamInputValue(null)).toBe("")
  })

  it("sends the picked Vietnam time as UTC", () => {
    expect(vietnamInputToUtc("2026-10-14T03:30")).toBe("2026-10-13T20:30:00Z")
    expect(vietnamInputToUtc("")).toBeNull()
    expect(vietnamInputToUtc("2026-10-14")).toBeNull()
  })
})

describe("restore confirmation", () => {
  it("accepts the phrase with or without diacritics", () => {
    expect(isRestoreConfirmed("khôi phục")).toBe(true)
    expect(isRestoreConfirmed("  KHOI   PHUC ")).toBe(true)
    expect(isRestoreConfirmed("khôi")).toBe(false)
  })
})

describe("describeRestorePoint", () => {
  it("names the type, finish time and size", () => {
    const run: BackupRun = {
      backupType: "DIFFERENTIAL",
      finishedAt: "2026-10-13T20:05:00Z",
      id: "r-1",
      sizeBytes: 2048,
      startedAt: "2026-10-13T20:00:00Z",
      status: "SUCCEEDED",
    }

    const label = describeRestorePoint(run)

    expect(label.startsWith("Differential · ")).toBe(true)
    expect(label).toContain("14/10/2026")
    expect(label).toContain("03:05")
    expect(label.endsWith(" · 2 KB")).toBe(true)
  })
})
