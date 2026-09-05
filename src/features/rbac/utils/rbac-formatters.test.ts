import { describe, expect, it } from "vitest"

import {
  expandImpliedPermissionIds,
  isImpliedByAll,
} from "@/features/rbac/utils/rbac-formatters"

const catalog = [
  { id: "user-all", name: "USER_ALL" },
  { id: "user-create", name: "USER_CREATE" },
  { id: "user-read", name: "USER_READ" },
  { id: "message-all", name: "MESSAGE_ALL" },
  { id: "message-send", name: "MESSAGE_SEND" },
]

describe("expandImpliedPermissionIds", () => {
  it("expands ALL to every other action on that resource, not just CRUD", () => {
    const expanded = expandImpliedPermissionIds(["user-all"], catalog)
    expect(expanded).toEqual(
      expect.arrayContaining(["user-all", "user-create", "user-read"])
    )
  })

  it("expands a non-CRUD action (SEND) implied by ALL", () => {
    const expanded = expandImpliedPermissionIds(["message-all"], catalog)
    expect(expanded).toEqual(
      expect.arrayContaining(["message-all", "message-send"])
    )
  })

  it("is a no-op when no ALL permission is selected", () => {
    const expanded = expandImpliedPermissionIds(["user-create"], catalog)
    expect(expanded).toEqual(["user-create"])
  })
})

describe("isImpliedByAll", () => {
  const resourcesWithAllChecked = new Set(["USER"])

  it("is true for a non-ALL action whose resource has ALL checked", () => {
    expect(
      isImpliedByAll({ name: "USER_CREATE" }, resourcesWithAllChecked)
    ).toBe(true)
  })

  it("is false for ALL itself, even if its own resource is in the set", () => {
    expect(isImpliedByAll({ name: "USER_ALL" }, resourcesWithAllChecked)).toBe(
      false
    )
  })

  it("is false for a resource whose ALL isn't checked", () => {
    expect(
      isImpliedByAll({ name: "MESSAGE_SEND" }, resourcesWithAllChecked)
    ).toBe(false)
  })
})
