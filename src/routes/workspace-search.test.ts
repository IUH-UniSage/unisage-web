import { describe, expect, it } from "vitest"

import {
  FEATURE_REGISTRY,
  getWorkspaceNavItems,
} from "@/routes/feature-registry"
import { normalizeSearchText, searchWorkspace } from "@/routes/workspace-search"
import { WORKSPACE_SEARCH_KEYWORDS } from "@/routes/workspace-search-keywords"

const adminItems = getWorkspaceNavItems("system-admin")

describe("normalizeSearchText", () => {
  it("strips Vietnamese diacritics and đ", () => {
    expect(normalizeSearchText("  Vai trò & Phân  quyền ")).toBe(
      "vai tro & phan quyen"
    )
    expect(normalizeSearchText("Đang xử lý")).toBe("dang xu ly")
  })
})

describe("searchWorkspace", () => {
  it("returns nothing for a blank query", () => {
    expect(searchWorkspace(adminItems, "   ")).toEqual([])
  })

  it("matches a sidebar item by label without accents", () => {
    const [first] = searchWorkspace(adminItems, "phong ban")
    expect(first?.id).toBe("departments")
    expect(first?.to).toBe("/admin/departments")
  })

  it("matches a sidebar item by an English keyword", () => {
    const ids = searchWorkspace(adminItems, "rbac").map((result) => result.id)
    expect(ids[0]).toBe("admin-rbac")
  })

  it("deep-links to a tab inside a page", () => {
    const result = searchWorkspace(adminItems, "budget").find(
      (entry) => entry.id === "admin-cost-management:budgets"
    )
    expect(result).toMatchObject({
      label: "Ngân sách",
      parentLabel: "Chi phí AI",
      to: "/admin/cost-management?tab=budgets",
    })
  })

  it("requires every token to match, across label and parent label", () => {
    const ids = searchWorkspace(adminItems, "cài đặt bảo mật").map(
      (result) => result.id
    )
    expect(ids).toEqual(["admin-settings:SECURITY"])
  })

  it("ranks an exact label match above keyword matches", () => {
    const [first] = searchWorkspace(adminItems, "nhật ký hệ thống")
    expect(first?.id).toBe("admin-logs")
  })

  it("only searches the items it is given", () => {
    const ingesterItems = getWorkspaceNavItems("ingester")
    const ids = searchWorkspace(ingesterItems, "chi phi").map(
      (result) => result.id
    )
    expect(ids).toEqual([])
  })
})

describe("WORKSPACE_SEARCH_KEYWORDS", () => {
  it("covers exactly the registered features", () => {
    const registryKeys = FEATURE_REGISTRY.map((entry) => entry.key).sort()
    expect(Object.keys(WORKSPACE_SEARCH_KEYWORDS).sort()).toEqual(registryKeys)
  })

  it("has unique tab values per entry", () => {
    for (const entry of Object.values(WORKSPACE_SEARCH_KEYWORDS)) {
      const values = (entry.tabs ?? []).map((tab) => tab.value)
      expect(new Set(values).size).toBe(values.length)
    }
  })
})
