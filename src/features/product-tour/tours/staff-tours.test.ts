import { describe, expect, it } from "vitest"

import { ROUTES } from "@/constants/paths"
import { DIALOG_TOURS } from "@/features/product-tour/tours/dialog-tours"
import { ROUTE_TOURS } from "@/features/product-tour/tours/route-tours"
import { PAGE_TOURS } from "@/features/product-tour/tours/staff-tours"
import { resolveStaffPageTour } from "@/features/product-tour/utils/resolve-page-tour"
import {
  FEATURE_REGISTRY,
  getWorkspaceFeatureKeyForPath,
  type StaffWorkspace,
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

describe("route tours", () => {
  const routeKey = (
    pathname: string,
    workspace: StaffWorkspace = "system-admin"
  ) => resolveStaffPageTour(workspace, pathname)?.key ?? null

  it("never reuses a list page key", () => {
    const routeKeys = ROUTE_TOURS.map((tour) => tour.key)

    expect(new Set(routeKeys).size).toBe(routeKeys.length)
    routeKeys.forEach((key) =>
      expect(Object.keys(PAGE_TOURS)).not.toContain(key)
    )
  })

  it("prefers the list page tour over a route tour", () => {
    expect(routeKey(ROUTES.adminUsers)).toBe("admin-users")
  })

  it("resolves create, edit and detail screens", () => {
    expect(routeKey(`${ROUTES.adminUsers}/new`)).toBe("user-form")
    expect(routeKey(`${ROUTES.adminUsers}/u-1/edit`)).toBe("user-form")
    expect(routeKey(`${ROUTES.adminUsers}/u-1`)).toBe("user-detail")
    expect(routeKey(`${ROUTES.adminRbac}/new`)).toBe("role-form")
    expect(routeKey(`${ROUTES.adminRbac}/r-1`)).toBe("role-detail")
    expect(routeKey(ROUTES.adminProfile)).toBe("admin-profile")
  })

  it("resolves document screens in both workspaces", () => {
    expect(routeKey(`${ROUTES.adminDocuments}/new`)).toBe("document-form")
    expect(routeKey(`${ROUTES.adminDocuments}/d-1/chunks`)).toBe(
      "document-chunks"
    )
    expect(routeKey(`${ROUTES.adminDocuments}/d-1/ingest`)).toBe(
      "ingest-wizard"
    )
    expect(routeKey(`${ROUTES.ingesterDocuments}/d-1/edit`, "ingester")).toBe(
      "document-form"
    )
    expect(routeKey(`${ROUTES.ingesterDocuments}/d-1`, "ingester")).toBe(
      "document-detail"
    )
    expect(routeKey(`${ROUTES.ingesterProcessing}/d-1`, "ingester")).toBe(
      "ingest-wizard"
    )
  })

  it("has no tour for an unknown screen", () => {
    expect(routeKey(`${ROUTES.adminUsers}/u-1/unknown`)).toBeNull()
  })
})

describe("dialog tours", () => {
  it("gives every dialog at least one anchored step", () => {
    Object.values(DIALOG_TOURS).forEach((tour) => {
      expect(tour.steps.some((step) => step.anchor)).toBe(true)
    })
  })
})
