import { expect, test } from "@playwright/test"

import { authenticateAs } from "./support/auth"
import { mockDashboardSummary } from "./support/dashboard"
import { mockRbac } from "./support/rbac"

test("starts the overview tour on a first-time admin's landing page", async ({
  page,
}, testInfo) => {
  await authenticateAs(page, "SUPER_ADMIN", undefined, { productTours: true })
  await mockDashboardSummary(page)
  await page.goto("/admin")

  const popover = page.locator(".driver-popover")
  const title = popover.locator(".driver-popover-title")
  await expect(title).toHaveText("Chào mừng đến UniSage")
  await expect(popover.locator(".driver-popover-progress-text")).toContainText(
    "Trang 1/"
  )
  await page.screenshot({
    path: testInfo.outputPath(
      `product-tour-overview-${testInfo.project.name}.png`
    ),
  })

  // Skipping counts as seen: no auto-start on the next visit.
  await popover.getByRole("button", { name: "Bỏ qua" }).click()
  await expect(popover).toHaveCount(0)
  await page.reload()
  await expect(
    page.getByRole("button", { name: "Hướng dẫn sử dụng trang này" })
  ).toBeVisible()
  await page.waitForTimeout(1_000)
  await expect(popover).toHaveCount(0)
})

test("runs a page's own tour only from its ? button", async ({ page }) => {
  await authenticateAs(page, "SUPER_ADMIN")
  await mockRbac(page)
  await page.goto("/admin/rbac")

  const popover = page.locator(".driver-popover")
  await expect(
    page.getByRole("heading", { name: "Danh sách vai trò" })
  ).toBeVisible()
  await page.waitForTimeout(1_000)
  await expect(popover).toHaveCount(0)

  await page
    .getByRole("button", { name: "Hướng dẫn sử dụng trang này" })
    .click()
  await expect(popover.locator(".driver-popover-title")).toHaveText(
    "Vai trò & phân quyền"
  )
})

test("tours a create screen reached from a list page", async ({
  page,
}, testInfo) => {
  await authenticateAs(page, "SUPER_ADMIN")
  await mockRbac(page)
  await page.goto("/admin/rbac/new")

  await page
    .getByRole("button", { name: "Hướng dẫn sử dụng trang này" })
    .click()
  const title = page.locator(".driver-popover .driver-popover-title")
  await expect(title).toHaveText("Biểu mẫu vai trò")
  await page
    .locator(".driver-popover")
    .getByRole("button", { name: "Tiếp" })
    .click()
  await expect(title).toHaveText("Tên vai trò")
  await page.waitForTimeout(400)
  await page.screenshot({
    path: testInfo.outputPath(
      `product-tour-route-${testInfo.project.name}.png`
    ),
  })
})

test("tours a dialog without closing it", async ({ page }, testInfo) => {
  await authenticateAs(page, "SUPER_ADMIN")
  await mockRbac(page)
  await page.goto("/admin/rbac")

  await page.getByRole("tab", { name: "Cấu hình quyền hạn" }).click()
  await page.getByRole("button", { name: "Thêm quyền hạn mới" }).click()

  const dialog = page.getByRole("dialog", { name: "Thêm quyền hạn mới" })
  const popover = page.locator(".driver-popover")
  const title = popover.locator(".driver-popover-title")
  const dialogTourButton = dialog.getByRole("button", {
    name: "Hướng dẫn sử dụng hộp thoại này",
  })

  // Nothing starts on its own; the dialog's ? runs its tour.
  await expect(dialog).toBeVisible()
  await page.waitForTimeout(1_000)
  await expect(popover).toHaveCount(0)
  await dialogTourButton.click()
  await expect(title).toHaveText("Quyền hạn")

  // Driving the tour must not count as a click outside the dialog.
  await popover.getByRole("button", { name: "Tiếp" }).click()
  await expect(title).toHaveText("Tên quyền")
  await expect(dialog).toBeVisible()
  await page.waitForTimeout(400)
  await page.screenshot({
    path: testInfo.outputPath(
      `product-tour-dialog-${testInfo.project.name}.png`
    ),
  })

  // Escape ends the tour, not the dialog.
  await page.keyboard.press("Escape")
  await expect(popover).toHaveCount(0)
  await expect(dialog).toBeVisible()

  // Once the tour ends the dialog behaves normally again.
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
})
