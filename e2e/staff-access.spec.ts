import { expect, test } from "@playwright/test"

import { mockRbac } from "./support/rbac"
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

test("manages roles and browses permissions without horizontal overflow", async ({
  page,
}, testInfo) => {
  await authenticateAs(page, "SUPER_ADMIN")
  await mockRbac(page)
  await page.goto("/admin/rbac")

  await expect(
    page.getByRole("heading", { name: "Danh sách vai trò" })
  ).toBeVisible()
  const roleResults =
    testInfo.project.name === "desktop-chromium"
      ? page.getByRole("table")
      : page.locator("article")
  await expect(
    roleResults.getByText("SUPER_ADMIN", { exact: true })
  ).toBeVisible()

  const viewportWidth = await page.evaluate(
    () => document.documentElement.clientWidth
  )
  const pageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth
  )
  expect(pageWidth).toBe(viewportWidth)

  await page.getByRole("button", { name: "Chỉnh sửa SUPER_ADMIN" }).click()
  await expect(
    page.getByRole("dialog", { name: "Chỉnh sửa vai trò" })
  ).toBeVisible()

  const updatePermission = page.getByRole("checkbox", {
    name: "Cho phép ROLE_UPDATE",
  })
  await expect(updatePermission).not.toBeChecked()
  await updatePermission.check()
  await page.getByRole("button", { name: "Lưu thay đổi" }).click()

  await expect(page.getByText("Đã cập nhật vai trò.")).toBeVisible()

  await page.getByLabel("Tìm tên vai trò").fill("viewer")
  await expect(roleResults.getByText("VIEWER", { exact: true })).toBeVisible()
  await expect(
    roleResults.getByText("SUPER_ADMIN", { exact: true })
  ).toHaveCount(0)

  await page.getByRole("tab", { name: "Cấu hình quyền hạn" }).click()
  await expect(
    page.getByRole("heading", { name: "Danh sách quyền hạn" })
  ).toBeVisible()
  await page.getByLabel("Tìm quyền hạn").fill("permission")
  const permissionResults =
    testInfo.project.name === "desktop-chromium"
      ? page.getByRole("table")
      : page.locator("article")
  await expect(permissionResults.getByText("PERMISSION_READ")).toBeVisible()
  await expect(permissionResults.getByText("ROLE_READ")).toHaveCount(0)
})

test("creates a role with assigned permissions", async ({ page }, testInfo) => {
  await authenticateAs(page, "SUPER_ADMIN")
  await mockRbac(page)
  await page.goto("/admin/rbac")

  await page.getByRole("button", { name: "Thêm vai trò mới" }).click()
  const dialog = page.getByRole("dialog", { name: "Thêm vai trò mới" })
  await dialog.getByLabel("Tên vai trò").fill("CONTENT_REVIEWER")
  await dialog.getByLabel("Mô tả").fill("Kiểm tra nội dung trước khi xuất bản.")
  await dialog.getByRole("checkbox", { name: "Cho phép ROLE_READ" }).check()
  await dialog.getByRole("button", { name: "Tạo vai trò" }).click()

  await expect(page.getByText("Đã tạo vai trò mới.")).toBeVisible()
  const roleResults =
    testInfo.project.name === "desktop-chromium"
      ? page.getByRole("table")
      : page.locator("article")
  await expect(
    roleResults.getByText("CONTENT_REVIEWER", { exact: true })
  ).toBeVisible()
})
