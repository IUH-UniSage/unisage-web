import { describe, expect, it } from "vitest"

import { ROUTES } from "@/constants/paths"
import { PAGE_TOURS } from "@/features/product-tour/tours/staff-tours"
import {
  FEATURE_REGISTRY,
  getWorkspaceFeatureKeyForPath,
} from "@/routes/feature-registry"

describe("staff page tours", () => {
  it("is keyed only by real FEATURE_REGISTRY entries", () => {
    const featureKeys = new Set(FEATURE_REGISTRY.map((entry) => entry.key))

    Object.keys(PAGE_TOURS).forEach((key) => {
      expect(featureKeys).toContain(key)
    })
  })

  it("resolves a workspace list page from its pathname", () => {
    expect(getWorkspaceFeatureKeyForPath("system-admin", ROUTES.admin)).toBe(
      "admin-overview"
    )
    expect(
      getWorkspaceFeatureKeyForPath("system-admin", `${ROUTES.adminUsers}/`)
    ).toBe("admin-users")
    expect(getWorkspaceFeatureKeyForPath("ingester", ROUTES.ingester)).toBe(
      "ingester-overview"
    )
  })

  it("has no page tour for detail or form screens", () => {
    expect(
      getWorkspaceFeatureKeyForPath("system-admin", `${ROUTES.adminUsers}/new`)
    ).toBeNull()
  })
})
