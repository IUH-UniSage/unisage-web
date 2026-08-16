import type { Page } from "@playwright/test"

const accessControlPermissions = [
  {
    accessLevel: null,
    id: "b76398bd-c8ac-4fa8-803e-0a91e207347c",
    isActive: true,
    name: "ROLE_READ",
  },
  {
    accessLevel: null,
    id: "c76398bd-c8ac-4fa8-803e-0a91e207347c",
    isActive: true,
    name: "ROLE_UPDATE",
  },
  {
    accessLevel: null,
    id: "d76398bd-c8ac-4fa8-803e-0a91e207347c",
    isActive: true,
    name: "PERMISSION_READ",
  },
] as const

export async function mockAccessControl(page: Page) {
  let assignedPermissionIds = [
    accessControlPermissions[0].id,
    accessControlPermissions[2].id,
  ]

  const getRole = () => ({
    description: "Quản trị cấu hình, tài khoản và quyền truy cập.",
    id: "e76398bd-c8ac-4fa8-803e-0a91e207347c",
    isActive: true,
    isSystemRole: true,
    name: "SUPER_ADMIN",
    permissions: accessControlPermissions
      .filter((permission) => assignedPermissionIds.includes(permission.id))
      .map(({ accessLevel, id, name }) => ({ accessLevel, id, name })),
  })

  await page.route("**/api/v1/rbac/permissions**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        code: 1000,
        data: {
          data: accessControlPermissions,
          limit: 500,
          page: 1,
          totalItems: accessControlPermissions.length,
          totalPages: 1,
        },
        message: "Successful",
      },
      status: 200,
    })
  })

  await page.route("**/api/v1/rbac/roles**", async (route) => {
    if (route.request().method() === "PUT") {
      const request = (await route.request().postDataJSON()) as {
        permissionIds: string[]
      }
      assignedPermissionIds = request.permissionIds

      await route.fulfill({
        contentType: "application/json",
        json: {
          code: 1000,
          data: getRole(),
          message: "Successful",
        },
        status: 200,
      })
      return
    }

    await route.fulfill({
      contentType: "application/json",
      json: {
        code: 1000,
        data: {
          data: [getRole()],
          limit: 500,
          page: 1,
          totalItems: 1,
          totalPages: 1,
        },
        message: "Successful",
      },
      status: 200,
    })
  })
}
