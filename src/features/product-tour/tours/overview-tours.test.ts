import { describe, expect, it } from "vitest"

import { ROUTES } from "@/constants/paths"
import {
  CLIENT_OVERVIEW_STOPS,
  resolveStaffOverviewStops,
} from "@/features/product-tour/tours/overview-tours"
import {
  getWorkspaceNavItems,
  type StaffWorkspace,
} from "@/routes/feature-registry"

const WORKSPACES: StaffWorkspace[] = ["ingester", "system-admin"]

describe("overview tours", () => {
  it.each(WORKSPACES)(
    "visits only real %s pages, starting on its landing page",
    (workspace) => {
      const navItems = getWorkspaceNavItems(workspace)
      const stops = resolveStaffOverviewStops(workspace, navItems)

      expect(stops.length).toBeGreaterThan(1)
      expect(stops[0].path).toBe(
        workspace === "ingester" ? ROUTES.ingester : ROUTES.admin
      )
      stops.forEach((stop) =>
        expect(navItems.map((item) => item.to)).toContain(stop.path)
      )
    }
  )

  it("leaves out pages the user cannot see", () => {
    const navItems = getWorkspaceNavItems("system-admin").filter(
      (item) => item.key !== "admin-users"
    )
    const paths = resolveStaffOverviewStops("system-admin", navItems).map(
      (stop) => stop.path
    )

    expect(paths).not.toContain(ROUTES.adminUsers)
    expect(paths).toContain(ROUTES.adminDocuments)
  })

  it("starts the student tour on the home page", () => {
    expect(CLIENT_OVERVIEW_STOPS[0].path).toBe(ROUTES.home)
  })
})
