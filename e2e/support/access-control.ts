import type { Page } from "@playwright/test"

const accessControlPermissions = [
  {
    accessLevel: null,
    createdAt: "2024-01-01T08:00:00",
    createdBy: "System",
    id: "b76398bd-c8ac-4fa8-803e-0a91e207347c",
    isActive: true,
    name: "ROLE_READ",
  },
  {
    accessLevel: null,
    createdAt: "2024-01-01T08:00:00",
    createdBy: "System",
    id: "c76398bd-c8ac-4fa8-803e-0a91e207347c",
    isActive: true,
    name: "ROLE_UPDATE",
  },
  {
    accessLevel: null,
    createdAt: "2024-01-01T08:00:00",
    createdBy: "System",
    id: "d76398bd-c8ac-4fa8-803e-0a91e207347c",
    isActive: true,
    name: "PERMISSION_READ",
  },
  {
    accessLevel: 2,
    createdAt: "2024-03-10T08:00:00",
    createdBy: "admin@unisage.edu",
    id: "f76398bd-c8ac-4fa8-803e-0a91e207347c",
    isActive: false,
    name: "DOCUMENT_READ",
  },
] as const

type RoleRequest = {
  description: string | null
  isActive: boolean
  isSystemRole: boolean
  name: string
  permissionIds: string[]
}

type MockRole = Omit<RoleRequest, "permissionIds"> & {
  createdAt: string
  createdBy: string
  id: string
  permissionIds: string[]
}

export async function mockAccessControl(page: Page) {
  const roles: MockRole[] = [
    {
      createdAt: "2024-01-01T08:00:00",
      createdBy: "System",
      description: "Quản trị cấu hình, tài khoản và quyền truy cập.",
      id: "e76398bd-c8ac-4fa8-803e-0a91e207347c",
      isActive: true,
      isSystemRole: true,
      name: "SUPER_ADMIN",
      permissionIds: [
        accessControlPermissions[0].id,
        accessControlPermissions[2].id,
      ],
    },
    {
      createdAt: "2024-03-10T08:00:00",
      createdBy: "admin@unisage.edu",
      description: "Quản trị quy trình nạp và duyệt tài liệu.",
      id: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
      isActive: true,
      isSystemRole: true,
      name: "INGEST_ADMIN",
      permissionIds: [accessControlPermissions[3].id],
    },
    {
      createdAt: "2024-03-22T08:00:00",
      createdBy: "manager@unisage.edu",
      description: "Chỉ được phép xem nội dung.",
      id: "976398bd-c8ac-4fa8-803e-0a91e207347c",
      isActive: false,
      isSystemRole: false,
      name: "VIEWER",
      permissionIds: [accessControlPermissions[0].id],
    },
  ]

  const getRole = (role: MockRole) => ({
    createdAt: role.createdAt,
    createdBy: role.createdBy,
    description: role.description,
    id: role.id,
    isActive: role.isActive,
    isSystemRole: role.isSystemRole,
    name: role.name,
    permissions: accessControlPermissions
      .filter((permission) => role.permissionIds.includes(permission.id))
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
    const method = route.request().method()
    const url = new URL(route.request().url())
    const roleId = url.pathname.match(/\/roles\/([^/]+)/)?.[1]

    if (method === "POST" && url.pathname.endsWith("/recover") && roleId) {
      const role = roles.find((candidate) => candidate.id === roleId)
      if (role) role.isActive = true
      await route.fulfill({
        contentType: "application/json",
        json: { code: 1000, data: null, message: "Successful" },
        status: 200,
      })
      return
    }

    if (method === "POST") {
      const request = (await route.request().postDataJSON()) as RoleRequest
      const role: MockRole = {
        ...request,
        createdAt: "2026-07-28T08:00:00",
        createdBy: "admin@unisage.edu",
        id: "876398bd-c8ac-4fa8-803e-0a91e207347c",
      }
      roles.push(role)
      await route.fulfill({
        contentType: "application/json",
        json: { code: 1000, data: getRole(role), message: "Successful" },
        status: 200,
      })
      return
    }

    if (method === "PUT" && roleId) {
      const request = (await route.request().postDataJSON()) as RoleRequest
      const role = roles.find((candidate) => candidate.id === roleId)
      if (role) Object.assign(role, request)
      await route.fulfill({
        contentType: "application/json",
        json: {
          code: 1000,
          data: role ? getRole(role) : null,
          message: "Successful",
        },
        status: 200,
      })
      return
    }

    if (method === "DELETE" && roleId) {
      const role = roles.find((candidate) => candidate.id === roleId)
      if (role) role.isActive = false
      await route.fulfill({
        contentType: "application/json",
        json: { code: 1000, data: null, message: "Successful" },
        status: 200,
      })
      return
    }

    await route.fulfill({
      contentType: "application/json",
      json: {
        code: 1000,
        data: {
          data: roles.map(getRole),
          limit: 500,
          page: 1,
          totalItems: roles.length,
          totalPages: 1,
        },
        message: "Successful",
      },
      status: 200,
    })
  })
}
