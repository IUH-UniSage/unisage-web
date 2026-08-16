import { expect, test, type Page } from "@playwright/test"

const sessionByRole = {
  INGEST_ADMIN: {
    code: "NV001",
    fullName: "Nguyễn Văn Ingest",
    role: "INGEST_ADMIN",
  },
  SUPER_ADMIN: {
    code: "AD001",
    fullName: "Trần Ngọc Huyền",
    role: "SUPER_ADMIN",
  },
  USER: {
    code: "SV001",
    fullName: "Nguyễn Minh Anh",
    role: "USER",
  },
} as const

const permissionsByRole = {
  INGEST_ADMIN: [
    "DOCUMENT_ALL",
    "DOCUMENT_CHUNK_ALL",
    "DOCUMENT_PROCESS_LOG_READ",
    "EMBEDDED_MODEL_READ",
    "INGEST_ALL",
  ],
  SUPER_ADMIN: ["SUPER_ADMIN_ALL"],
  USER: ["DOCUMENT_READ"],
} as const

async function authenticateAs(
  page: Page,
  role: keyof typeof sessionByRole = "USER",
  permissionNames: readonly string[] = permissionsByRole[role]
) {
  const account = sessionByRole[role]
  const session = {
    avatarUrl: null,
    code: account.code,
    email: `${account.code.toLowerCase()}@example.edu.vn`,
    fullName: account.fullName,
    isSystemRole: role !== "USER",
    permissions: permissionNames.map((name, index) => ({
      accessLevel: 5,
      id: `a931f2ee-e2b1-45cf-9299-6f96f8a8db8${index}`,
      name,
    })),
    role,
    userId: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
  }

  await page.addInitScript(
    ({ cachedSession, storageKey }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(cachedSession))
    },
    {
      cachedSession: session,
      storageKey: "unisage_user_profile",
    }
  )
  await page.route("**/api/v1/auth/refresh", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        code: 1000,
        data: {
          accessToken: "access-token",
          code: account.code,
          email: session.email,
          profiles: [],
          refreshToken: "refresh-token",
          refreshTokenExpirationMs: 60_000,
        },
        message: "Successful",
      },
      status: 200,
    })
  })
}

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

async function mockAccessControl(page: Page) {
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

test("renders the user home without horizontal overflow", async ({ page }) => {
  await authenticateAs(page)
  await page.goto("/")

  await expect(
    page.getByRole("heading", {
      name: "Hôm nay UniSage có thể giúp bạn hiểu điều gì?",
    })
  ).toBeVisible()

  const viewportWidth = await page.evaluate(
    () => document.documentElement.clientWidth
  )
  const pageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth
  )

  expect(pageWidth).toBe(viewportWidth)
})

test("uses a dedicated chat shell and keeps the composer visible", async ({
  page,
}) => {
  await authenticateAs(page)
  await page.goto("/chat")

  await expect(
    page.getByRole("navigation", {
      name: "Điều hướng người dùng",
    })
  ).toHaveCount(0)
  await expect(
    page.getByText("Trường Đại học Công nghiệp Thành phố Hồ Chí Minh")
  ).toHaveCount(0)
  await expect(page.getByRole("link", { name: "Về trang chủ" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Bắt đầu cuộc trò chuyện mới" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Nguồn tham chiếu" })
  ).toHaveCount(0)
  await expect(page.getByLabel("Tin nhắn gửi UniSage")).toBeVisible()
})

test("opens a saved conversation and returns to new chat", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium")

  await authenticateAs(page)
  await page.goto("/chat")
  await page
    .getByRole("button", {
      name: "Điều kiện tốt nghiệp ngành Công nghệ thông tin Hôm nay",
    })
    .click()

  await expect(
    page.getByRole("heading", {
      name: "Điều kiện tốt nghiệp ngành Công nghệ thông tin",
      level: 1,
    })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Nguồn tham chiếu" })
  ).toBeVisible()

  await page.getByRole("button", { name: "Cuộc trò chuyện mới" }).click()
  await expect(
    page.getByRole("heading", { name: "Bắt đầu cuộc trò chuyện mới" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Nguồn tham chiếu" })
  ).toHaveCount(0)
})

test("filters history and toggles desktop panels", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium")

  await authenticateAs(page)
  await page.goto("/chat")

  const historyViewport = page
    .locator('[data-slot="scroll-area-viewport"]')
    .first()
  expect(
    await historyViewport.evaluate(
      (element) => element.scrollWidth === element.clientWidth
    )
  ).toBe(true)

  const search = page.getByLabel("Tìm kiếm cuộc trò chuyện")
  await search.fill("bảo hiểm")
  await expect(
    page.getByRole("button", { name: "Bảo hiểm y tế sinh viên Hôm qua" })
  ).toBeVisible()
  await expect(
    page.getByRole("button", {
      name: "Điều kiện tốt nghiệp ngành Công nghệ thông tin Hôm nay",
    })
  ).toHaveCount(0)

  const hideHistoryButton = page.getByRole("button", {
    name: "Ẩn lịch sử trò chuyện",
  })
  await search.fill("")
  await hideHistoryButton.click()
  await expect(
    page.getByRole("button", { name: "Mở lịch sử trò chuyện" })
  ).toBeVisible()
  await expect(page.getByLabel("Tìm kiếm cuộc trò chuyện")).toHaveCount(0)

  await page.getByRole("button", { name: "Mở lịch sử trò chuyện" }).click()
  await expect(page.getByLabel("Tìm kiếm cuộc trò chuyện")).toBeVisible()
})

test("manages a conversation without share or archive actions", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium")

  await authenticateAs(page)
  await page.goto("/chat")
  await page
    .getByRole("button", {
      name: "Tùy chọn cho Điều kiện tốt nghiệp ngành Công nghệ thông tin",
    })
    .click()

  const menu = page.getByRole("menu", {
    name: "Tùy chọn cho Điều kiện tốt nghiệp ngành Công nghệ thông tin",
  })
  await expect(menu.getByRole("menuitem", { name: "Đổi tên" })).toBeVisible()
  await expect(
    menu.getByRole("menuitem", { name: "Ghim cuộc trò chuyện" })
  ).toBeVisible()
  await expect(menu.getByRole("menuitem", { name: "Xóa" })).toBeVisible()
  await expect(menu.getByRole("menuitem", { name: "Share" })).toHaveCount(0)
  await expect(menu.getByRole("menuitem", { name: "Archive" })).toHaveCount(0)

  await menu.getByRole("menuitem", { name: "Đổi tên" }).click()
  const renameInput = page.getByLabel(
    "Đổi tên Điều kiện tốt nghiệp ngành Công nghệ thông tin"
  )
  await renameInput.fill("Điều kiện tốt nghiệp đã cập nhật")
  await renameInput.press("Enter")
  await expect(
    page.getByRole("button", {
      name: "Điều kiện tốt nghiệp đã cập nhật Hôm nay",
    })
  ).toBeVisible()
})

test("opens the mobile chat history drawer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop-chromium")

  await authenticateAs(page)
  await page.goto("/chat")
  await expect(
    page.getByRole("button", { name: "Tùy chọn cuộc trò chuyện" })
  ).toHaveCount(0)

  const composerPosition = await page
    .getByLabel("Tin nhắn gửi UniSage")
    .evaluate((element) => {
      const bounds = element.getBoundingClientRect()
      return bounds.top / window.innerHeight
    })

  expect(composerPosition).toBeGreaterThan(0.7)

  await page.getByRole("button", { name: "Mở lịch sử trò chuyện" }).click()

  const drawer = page.getByRole("dialog", { name: "Lịch sử trò chuyện" })
  await expect(drawer).toBeVisible()
  await expect(drawer.getByLabel("Tìm kiếm lịch sử trò chuyện")).toBeVisible()
  await expect(
    drawer.getByRole("button", {
      name: "Điều kiện tốt nghiệp ngành Công nghệ thông tin Hôm nay",
    })
  ).toBeVisible()
})

test("links only to supported user workspaces", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium")

  await authenticateAs(page)
  await page.goto("/")

  const navigation = page.getByRole("navigation", {
    name: "Điều hướng người dùng",
  })

  await expect(navigation.getByRole("link")).toHaveCount(3)
  await expect(
    navigation.getByRole("link", { name: "Trợ lý UniSage" })
  ).toHaveAttribute("href", "/chat")
  await expect(
    navigation.getByRole("link", { name: "Thư viện tri thức" })
  ).toHaveAttribute("href", "/knowledge")
  await expect(
    navigation.getByRole("link", { name: "Hỗ trợ sinh viên" })
  ).toHaveAttribute("href", "/tickets")
})

test("opens the mobile navigation drawer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop-chromium")

  await authenticateAs(page)
  await page.goto("/")
  await page.getByRole("button", { name: "Mở điều hướng" }).click()

  const drawer = page.getByRole("dialog", { name: "Điều hướng người dùng" })

  await expect(drawer).toBeVisible()
  await expect(
    drawer.getByRole("link", { name: "Trợ lý UniSage" })
  ).toBeVisible()
  await expect(
    drawer.getByRole("link", { name: "Thư viện tri thức" })
  ).toBeVisible()
  await expect(
    drawer.getByRole("link", { name: "Hỗ trợ sinh viên" })
  ).toBeVisible()
  await expect(drawer.getByRole("link", { name: "Thông báo" })).toBeVisible()
  await expect(
    drawer.getByRole("link", { name: "Hồ sơ và quyền truy cập" })
  ).toBeVisible()

  await page.getByRole("button", { name: "Đóng điều hướng" }).click()
  await expect(drawer).not.toBeVisible()
})

test("redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/admin")

  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.getByRole("heading", { name: "Đăng nhập UniSage" })
  ).toBeVisible()
})

test("redirects a user away from another role workspace", async ({ page }) => {
  await authenticateAs(page)
  await page.goto("/admin")

  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.getByRole("heading", {
      name: "Hôm nay UniSage có thể giúp bạn hiểu điều gì?",
    })
  ).toBeVisible()
})

test("filters admin navigation and blocks a missing permission", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium")

  await authenticateAs(page, "SUPER_ADMIN", ["USER_READ"])
  await page.goto("/admin")

  const navigation = page.getByRole("navigation", {
    name: "Điều hướng Quản trị hệ thống",
  })

  await expect(navigation.getByRole("link")).toHaveCount(2)
  await expect(
    navigation.getByRole("link", { name: "Quản lý người dùng" })
  ).toBeVisible()
  await expect(
    navigation.getByRole("link", { name: "Quản trị tài liệu" })
  ).toHaveCount(0)

  await page.goto("/admin/documents")

  await expect(page).toHaveURL(/\/admin$/)
  await expect(
    page.getByRole("heading", { name: "Tổng quan hệ thống" })
  ).toBeVisible()
})

test("shows an access denied state without a redirect loop", async ({
  page,
}) => {
  await authenticateAs(page, "INGEST_ADMIN", [])
  await page.goto("/ingester")

  await expect(page).toHaveURL(/\/ingester$/)
  await expect(
    page.getByRole("heading", { name: "Bạn không có quyền truy cập" })
  ).toBeVisible()
})

test("manages role permissions without horizontal overflow", async ({
  page,
}) => {
  await authenticateAs(page, "SUPER_ADMIN")
  await mockAccessControl(page)
  await page.goto("/admin/access-control")

  await expect(
    page.getByRole("heading", { name: "Vai trò & phân quyền" })
  ).toBeVisible()
  await expect(
    page.getByText("Vai trò hệ thống", { exact: true })
  ).toBeVisible()

  const viewportWidth = await page.evaluate(
    () => document.documentElement.clientWidth
  )
  const pageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth
  )
  expect(pageWidth).toBe(viewportWidth)

  const updatePermission = page.getByRole("checkbox", {
    name: "Cho phép ROLE_UPDATE",
  })
  await expect(updatePermission).not.toBeChecked()
  await updatePermission.check()
  await page.getByRole("button", { name: "Lưu phân quyền" }).click()

  await expect(page.getByText("Đã cập nhật quyền của vai trò.")).toBeVisible()
  await expect(updatePermission).toBeChecked()

  await page.getByLabel("Tìm quyền hạn").fill("permission")
  await expect(page.getByText("PERMISSION_READ")).toBeVisible()
  await expect(page.getByText("ROLE_READ")).toHaveCount(0)
})

test("logs out and clears the cached profile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium")

  await authenticateAs(page)
  await page.route("**/api/v1/auth/logout", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        code: 1000,
        data: null,
        message: "Successful",
      },
      status: 200,
    })
  })
  await page.goto("/")
  await page.getByRole("button", { name: "Đăng xuất" }).click()

  await expect(page).toHaveURL(/\/login$/)
  expect(
    await page.evaluate(() =>
      window.localStorage.getItem("unisage_user_profile")
    )
  ).toBeNull()
})

const workspaceRoutes = [
  {
    heading: "Đăng nhập UniSage",
    name: "authentication",
    path: "/login",
  },
  {
    heading: "Tài khoản do nhà trường cấp",
    name: "registration",
    path: "/register",
    role: null,
  },
  {
    heading: "Tổng quan nạp tài liệu",
    name: "ingester",
    path: "/ingester",
    role: "INGEST_ADMIN",
  },
  {
    heading: "Tổng quan hệ thống",
    name: "system admin",
    path: "/admin",
    role: "SUPER_ADMIN",
  },
] as const

for (const workspace of workspaceRoutes) {
  test(`renders the ${workspace.name} workspace`, async ({ page }) => {
    if ("role" in workspace && workspace.role) {
      await authenticateAs(page, workspace.role)
    }
    await page.goto(workspace.path)

    await expect(
      page.getByRole("heading", { name: workspace.heading })
    ).toBeVisible()
  })
}

test("redirects the legacy login route", async ({ page }) => {
  await page.goto("/auth/login")

  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.getByRole("heading", { name: "Đăng nhập UniSage" })
  ).toBeVisible()
})

test("redirects the legacy registration route", async ({ page }) => {
  await page.goto("/auth/register")

  await expect(page).toHaveURL(/\/register$/)
  await expect(
    page.getByRole("heading", { name: "Tài khoản do nhà trường cấp" })
  ).toBeVisible()
})

test("keeps desktop auth pages inside the viewport", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium")

  for (const path of ["/login", "/register"]) {
    await page.goto(path)
    await page.getByRole("main").waitFor()

    const viewport = await page.evaluate(() => ({
      clientHeight: document.documentElement.clientHeight,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
    }))

    expect(viewport.scrollHeight).toBe(viewport.clientHeight)
    expect(viewport.scrollWidth).toBe(viewport.clientWidth)
  }
})

test("switches between light and dark themes", async ({ page }) => {
  await page.goto("/login")

  const themeToggle = page.getByRole("button", {
    name: /Chuyển sang giao diện/,
  })
  const initialDarkMode = await page
    .locator("html")
    .evaluate((element) => element.classList.contains("dark"))

  await themeToggle.click()

  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((element) => element.classList.contains("dark"))
    )
    .toBe(!initialDarkMode)
})
