import { describe, expect, it } from "vitest"

import { ROUTES } from "@/constants/paths"
import {
  getPostSignInPath,
  getRoleHome,
  readReturnPath,
  USER_ROLES,
} from "@/features/auth/utils/role-routing"

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

describe("post sign-in path", () => {
  it("returns to an internal `from` path", () => {
    expect(getPostSignInPath({ from: "/share/abc" }, USER_ROLES.user)).toBe(
      "/share/abc"
    )
    expect(
      getPostSignInPath({ from: "/tickets/1" }, USER_ROLES.superAdmin)
    ).toBe("/tickets/1")
  })

  it.each([
    ["//evil.com"],
    ["/\\evil.com"],
    ["https://evil.com/share/abc"],
    ["javascript:alert(1)"],
    ["share/abc"],
    [""],
  ])("ignores the unsafe `from` %s", (from) => {
    expect(readReturnPath({ from })).toBeNull()
    expect(getPostSignInPath({ from }, USER_ROLES.ingestAdmin)).toBe(
      ROUTES.ingester
    )
  })

  it.each([[null], [undefined], ["/share/abc"], [{ from: 42 }], [{}]])(
    "falls back to the role home for state %j",
    (state) => {
      expect(getPostSignInPath(state, USER_ROLES.user)).toBe(ROUTES.home)
    }
  )
})
