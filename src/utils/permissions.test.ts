import { describe, expect, it } from "vitest"

import {
  hasAnyPermission,
  hasEveryPermission,
  hasPermission,
  hasPermissionInfo,
  PERMISSIONS,
} from "@/utils/permissions"

describe("permission helpers", () => {
  const granted = [PERMISSIONS.documentRead, PERMISSIONS.userRead]

  it("requires every permission for all checks", () => {
    expect(
      hasEveryPermission(granted, [
        PERMISSIONS.documentRead,
        PERMISSIONS.userRead,
      ])
    ).toBe(true)
    expect(
      hasEveryPermission(granted, [
        PERMISSIONS.documentRead,
        PERMISSIONS.userCreate,
      ])
    ).toBe(false)
  })

  it("accepts one matching permission for any checks", () => {
    expect(
      hasAnyPermission(granted, [PERMISSIONS.userAll, PERMISSIONS.userRead])
    ).toBe(true)
  })

  it("lets resource and super-admin wildcards cover concrete actions", () => {
    expect(hasPermission([PERMISSIONS.userAll], PERMISSIONS.userDelete)).toBe(
      true
    )
    expect(
      hasPermission([PERMISSIONS.superAdminAll], PERMISSIONS.roleCreate)
    ).toBe(true)
  })

  it("enforces minimum access levels when a policy requires one", () => {
    const levelThreeDocument = {
      accessLevel: 3,
      id: "a931f2ee-e2b1-45cf-9299-6f96f8a8db89",
      name: PERMISSIONS.documentAll,
    }

    expect(
      hasPermissionInfo([levelThreeDocument], {
        minimumAccessLevel: 3,
        name: PERMISSIONS.documentRead,
      })
    ).toBe(true)
    expect(
      hasPermissionInfo([levelThreeDocument], {
        minimumAccessLevel: 4,
        name: PERMISSIONS.documentRead,
      })
    ).toBe(false)
  })
})
