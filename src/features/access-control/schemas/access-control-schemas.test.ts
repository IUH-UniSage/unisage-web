import { describe, expect, it } from "vitest"

import {
  accessPermissionPageSchema,
  accessRolePageSchema,
  updateRoleRequestSchema,
} from "@/features/access-control/schemas/access-control-schemas"

const permission = {
  accessLevel: null,
  createdAt: "2026-07-28T08:00:00",
  createdBy: "system",
  id: "b76398bd-c8ac-4fa8-803e-0a91e207347c",
  isActive: true,
  name: "ROLE_READ",
  updatedAt: null,
  updatedBy: null,
}

describe("access-control schemas", () => {
  it("parses the Backend role page contract", () => {
    const page = accessRolePageSchema.parse({
      data: [
        {
          createdAt: "2026-07-28T08:00:00",
          createdBy: "system",
          description: "Quản trị hệ thống",
          id: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
          isActive: true,
          isSystemRole: true,
          name: "SUPER_ADMIN",
          permissions: [
            {
              accessLevel: permission.accessLevel,
              id: permission.id,
              name: permission.name,
            },
          ],
          updatedAt: null,
          updatedBy: null,
        },
      ],
      limit: 20,
      page: 1,
      totalItems: 1,
      totalPages: 1,
    })

    expect(page.data[0]?.permissions[0]?.name).toBe("ROLE_READ")
  })

  it("parses the Backend permission page contract", () => {
    const page = accessPermissionPageSchema.parse({
      data: [permission],
      limit: 20,
      page: 1,
      totalItems: 1,
      totalPages: 1,
    })

    expect(page.data[0]).toMatchObject({
      isActive: true,
      name: "ROLE_READ",
    })
  })

  it("validates the complete permission assignment payload", () => {
    expect(
      updateRoleRequestSchema.parse({
        description: "Quản trị hệ thống",
        isActive: true,
        isSystemRole: true,
        name: "SUPER_ADMIN",
        permissionIds: [permission.id],
      }).permissionIds
    ).toEqual([permission.id])
  })
})
