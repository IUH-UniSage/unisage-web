import { describe, expect, it } from "vitest"

import {
  buildPermissionMatrix,
  getRowIds,
} from "@/features/rbac/utils/permission-matrix"
import type { AccessPermission } from "@/features/rbac/schemas/rbac-schemas"

function permission(name: string): AccessPermission {
  return {
    createdAt: "2026-07-28T08:00:00",
    createdBy: "system",
    id: name,
    isActive: true,
    name,
    updatedAt: null,
    updatedBy: null,
  }
}

const catalog = [
  permission("USER_ALL"),
  permission("USER_CREATE"),
  permission("USER_READ"),
  permission("USER_UPDATE"),
  permission("USER_DELETE"),
  permission("MESSAGE_ALL"),
  permission("MESSAGE_READ"),
  permission("MESSAGE_SEND"),
]

describe("buildPermissionMatrix", () => {
  it("groups permissions by resource with actions keyed by cell", () => {
    const rows = buildPermissionMatrix(catalog, "")

    const userRow = rows.find((row) => row.resource === "USER")
    expect(userRow?.cells.ALL?.name).toBe("USER_ALL")
    expect(userRow?.cells.CREATE?.name).toBe("USER_CREATE")
    expect(userRow?.cells.DELETE?.name).toBe("USER_DELETE")

    const messageRow = rows.find((row) => row.resource === "MESSAGE")
    expect(messageRow?.cells.SEND?.name).toBe("MESSAGE_SEND")
    expect(messageRow?.cells.CREATE).toBeUndefined()
  })

  it("filters rows by search query, reusing groupPermissions' search", () => {
    const rows = buildPermissionMatrix(catalog, "message")
    expect(rows).toHaveLength(1)
    expect(rows[0]?.resource).toBe("MESSAGE")
  })
})

describe("getRowIds", () => {
  it("collects every existing permission id in a row", () => {
    const rows = buildPermissionMatrix(catalog, "")
    const userRow = rows.find((row) => row.resource === "USER")!
    expect(getRowIds(userRow)).toHaveLength(5)
  })
})
