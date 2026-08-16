import { expect, test } from "@playwright/test"

import { mockAccessControl } from "./support/access-control"
import { authenticateAs } from "./support/auth"

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
