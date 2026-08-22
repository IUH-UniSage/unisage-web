import { expect, test } from "@playwright/test"

import { authenticateAs } from "./support/auth"

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
    heading: "Đăng ký tài khoản",
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
    page.getByRole("heading", { name: "Đăng ký tài khoản" })
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
