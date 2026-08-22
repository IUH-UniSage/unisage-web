import { describe, expect, it } from "vitest"

import { ROUTES } from "@/constants/paths"
import { getRoleHome, USER_ROLES } from "@/features/auth/utils/role-routing"

describe("role routing", () => {
  it.each([
    [USER_ROLES.user, ROUTES.home],
    [USER_ROLES.ingestAdmin, ROUTES.ingester],
    [USER_ROLES.superAdmin, ROUTES.admin],
    ["CUSTOM_ROLE", ROUTES.home],
  ])("maps %s to %s", (role, expectedPath) => {
    expect(getRoleHome(role)).toBe(expectedPath)
  })
})
