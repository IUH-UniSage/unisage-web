import { describe, expect, it } from "vitest"

import {
  visibleDepartmentRows,
  type FlattenedDepartmentNode,
} from "@/features/departments/utils/tree"

function node(
  id: string,
  depth: number,
  parentId: string | null = null
): FlattenedDepartmentNode {
  return {
    children: [],
    depth,
    id,
    isActive: true,
    name: id,
    parentId,
    totalChildrenCount: 0,
  } as FlattenedDepartmentNode
}

const items = [
  node("khoa", 0),
  node("bo-mon", 1, "khoa"),
  node("nhom", 2, "bo-mon"),
  node("phong", 0),
]

const ids = (rows: FlattenedDepartmentNode[]) => rows.map((row) => row.id)

describe("visibleDepartmentRows", () => {
  it("shows only top-level rows while everything is collapsed", () => {
    expect(ids(visibleDepartmentRows(items, () => false))).toEqual([
      "khoa",
      "phong",
    ])
  })

  it("opens one level per expanded parent", () => {
    const expanded = new Set(["khoa"])
    expect(ids(visibleDepartmentRows(items, (id) => expanded.has(id)))).toEqual(
      ["khoa", "bo-mon", "phong"]
    )
  })

  it("treats a row whose parent was filtered out as top level", () => {
    expect(
      ids(visibleDepartmentRows([node("nhom", 2, "bo-mon")], () => false))
    ).toEqual(["nhom"])
  })
})
