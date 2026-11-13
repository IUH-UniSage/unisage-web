import { describe, expect, it } from "vitest"

import { countSelectedByStatus } from "@/utils/selection"

const rows = [
  { id: "a", isActive: true },
  { id: "b", isActive: true },
  { id: "c", isActive: false },
]
const isActive = (row: (typeof rows)[number]) => row.isActive

describe("countSelectedByStatus", () => {
  it("returns zero counts when nothing is selected", () => {
    expect(countSelectedByStatus(rows, new Set(), isActive)).toEqual({
      active: 0,
      inactive: 0,
    })
  })

  it("counts only active rows when all selected rows are active", () => {
    expect(countSelectedByStatus(rows, new Set(["a", "b"]), isActive)).toEqual({
      active: 2,
      inactive: 0,
    })
  })

  it("counts both statuses for a mixed selection and ignores unknown ids", () => {
    expect(
      countSelectedByStatus(rows, new Set(["a", "c", "missing"]), isActive)
    ).toEqual({ active: 1, inactive: 1 })
  })
})
