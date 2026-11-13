import { describe, expect, it } from "vitest"

import type { DepartmentNode } from "@/features/departments/schemas/department-schemas"
import {
  buildDepartmentIndex,
  findBranchesWithoutLeaf,
  toggleDepartmentCascade,
  withCompletedAncestors,
  withoutTickedAncestors,
} from "@/features/users/utils/department-selection"

const node = (
  id: string,
  children: DepartmentNode[] = [],
  isActive = true
): DepartmentNode => ({ children, id, isActive, name: id })

// khoa > (bm1, bm2 > (nhom)), phong, cu (inactive child of phong)
const tree = [
  node("khoa", [node("bm1"), node("bm2", [node("nhom")])]),
  node("phong", [node("cu", [], false)]),
]
const index = buildDepartmentIndex(tree)
const sorted = (set: Set<string>) => [...set].sort()

describe("toggleDepartmentCascade", () => {
  it("ticking a parent ticks its whole subtree", () => {
    expect(sorted(toggleDepartmentCascade(new Set(), "khoa", index))).toEqual([
      "bm1",
      "bm2",
      "khoa",
      "nhom",
    ])
  })

  it("ticking the last missing child ticks the parent chain", () => {
    const next = toggleDepartmentCascade(new Set(["bm1"]), "bm2", index)
    expect(sorted(next)).toEqual(["bm1", "bm2", "khoa", "nhom"])
  })

  it("unticking a child unticks its ancestors but keeps siblings", () => {
    const all = toggleDepartmentCascade(new Set(), "khoa", index)
    expect(sorted(toggleDepartmentCascade(all, "nhom", index))).toEqual(["bm1"])
  })
})

describe("findBranchesWithoutLeaf", () => {
  it("is null when nothing is assigned", () => {
    expect(findBranchesWithoutLeaf([], index)).toBeNull()
  })

  it("accepts a leaf with its ancestors", () => {
    expect(findBranchesWithoutLeaf(["khoa", "bm2", "nhom"], index)).toEqual([])
  })

  it("names a parent assigned without any of its leaves", () => {
    expect(findBranchesWithoutLeaf(["khoa", "bm2"], index)).toEqual([
      "bm2",
      "khoa",
    ])
  })

  it("treats a unit whose only children are inactive as a leaf", () => {
    expect(findBranchesWithoutLeaf(["phong"], index)).toEqual([])
  })
})

describe("picker hand-off", () => {
  it("drops ticked parents so the list derives their level", () => {
    expect(
      withoutTickedAncestors(["khoa", "bm1", "bm2", "nhom"], index).sort()
    ).toEqual(["bm1", "nhom"])
  })

  it("re-ticks parents whose children are all ticked", () => {
    expect(sorted(withCompletedAncestors(["bm1", "nhom"], index))).toEqual([
      "bm1",
      "bm2",
      "khoa",
      "nhom",
    ])
  })
})
