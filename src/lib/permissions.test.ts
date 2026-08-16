import { describe, expect, it } from "vitest"

import { PERMISSIONS } from "@/lib/permissions"
import { hasAnyPermission, hasEveryPermission } from "@/lib/permissions"

describe("permission helpers", () => {
  const granted = [PERMISSIONS.knowledgeRead, PERMISSIONS.analyticsRead]

  it("requires every permission for all checks", () => {
    expect(
      hasEveryPermission(granted, [
        PERMISSIONS.knowledgeRead,
        PERMISSIONS.analyticsRead,
      ])
    ).toBe(true)
    expect(
      hasEveryPermission(granted, [
        PERMISSIONS.knowledgeRead,
        PERMISSIONS.usersManage,
      ])
    ).toBe(false)
  })

  it("accepts one matching permission for any checks", () => {
    expect(
      hasAnyPermission(granted, [
        PERMISSIONS.usersManage,
        PERMISSIONS.analyticsRead,
      ])
    ).toBe(true)
  })
})
