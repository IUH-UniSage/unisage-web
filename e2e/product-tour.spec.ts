import { expect, type Page, test } from "@playwright/test"

import { authenticateAs, PRODUCT_TOUR_KEYS } from "./support/auth"
import { mockRbac } from "./support/rbac"

test("walks a first-time admin through the page and lets them replay it", async ({
  page,
}, testInfo) => {
  await authenticateAs(page, "SUPER_ADMIN", undefined, { productTours: true })
  await mockRbac(page)
  await page.goto("/admin/rbac")

  const popover = page.locator(".driver-popover")
  const title = popover.locator(".driver-popover-title")

  // First visit: workspace intro runs ahead of the page's own steps.
  await expect(title).toHaveText("Chào mừng đến không gian Quản trị hệ thống")
  await page.screenshot({
    path: testInfo.outputPath(
      `product-tour-intro-${testInfo.project.name}.png`
    ),
  })

  // driver.js reuses one button for "Tiếp" and, on the last step, "Hoàn tất".
  // Wait for each step's title to change so we never read the previous
  // step's button label mid-transition.
  const nextButton = popover.locator(".driver-popover-next-btn")
  for (let step = 0; step < 15; step += 1) {
    const currentTitle = (await title.textContent()) ?? ""
    if ((await nextButton.textContent()) === "Hoàn tất") break
    await nextButton.click()
    await expect(title).not.toHaveText(currentTitle)
    if ((await title.textContent()) === "Vai trò & phân quyền") {
      // Let driver.js finish its popover fade-in before capturing.
      await page.waitForTimeout(400)
      await page.screenshot({
        path: testInfo.outputPath(
          `product-tour-page-${testInfo.project.name}.png`
        ),
      })
    }
  }
  await expect(nextButton).toHaveText("Hoàn tất")
  await nextButton.click()
  await expect(popover).toHaveCount(0)

  // Second visit: nothing auto-starts.
  await page.reload()
  await expect(
    page.getByRole("heading", { name: "Danh sách vai trò" })
  ).toBeVisible()
  await page.waitForTimeout(1_000)
  await expect(popover).toHaveCount(0)

  // Replay from the header button shows only the page's steps.
  await page
    .getByRole("button", { name: "Hướng dẫn sử dụng trang này" })
    .click()
  await expect(title).toHaveText("Vai trò & phân quyền")
})

test("lets a first-time admin skip the tour", async ({ page }) => {
  await authenticateAs(page, "SUPER_ADMIN", undefined, { productTours: true })
  await mockRbac(page)
  await page.goto("/admin/rbac")

  const popover = page.locator(".driver-popover")
  await expect(popover.locator(".driver-popover-title")).toHaveText(
    "Chào mừng đến không gian Quản trị hệ thống"
  )
  await popover.getByRole("button", { name: "Bỏ qua" }).click()
  await expect(popover).toHaveCount(0)

  // Skipping counts as seen: no auto-start on the next visit.
  await page.reload()
  await expect(
    page.getByRole("heading", { name: "Danh sách vai trò" })
  ).toBeVisible()
  await page.waitForTimeout(1_000)
  await expect(popover).toHaveCount(0)
})

// Seeds every tour as seen except `unseen`, so only that one auto-starts.
async function seeOnlyTour(page: Page, unseen: string) {
  await page.addInitScript(
    ({ keys, storageKey }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(keys))
    },
    {
      keys: PRODUCT_TOUR_KEYS.filter((key) => key !== unseen),
      storageKey: "unisage_product_tour_seen",
    }
  )
}

test("tours a create screen reached from a list page", async ({
  page,
}, testInfo) => {
  await authenticateAs(page, "SUPER_ADMIN", undefined, { productTours: true })
  await seeOnlyTour(page, "page:role-form")
  await mockRbac(page)
  await page.goto("/admin/rbac/new")

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
  await authenticateAs(page, "SUPER_ADMIN", undefined, { productTours: true })
  await seeOnlyTour(page, "dialog:permission-form")
  await mockRbac(page)
  await page.goto("/admin/rbac")

  await page.getByRole("tab", { name: "Cấu hình quyền hạn" }).click()
  await page.getByRole("button", { name: "Thêm quyền hạn mới" }).click()

  const dialog = page.getByRole("dialog", { name: "Thêm quyền hạn mới" })
  const popover = page.locator(".driver-popover")
  const title = popover.locator(".driver-popover-title")
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

  // The dialog's own ? replays it.
  await dialog
    .getByRole("button", { name: "Hướng dẫn sử dụng hộp thoại này" })
    .click()
  await expect(title).toHaveText("Quyền hạn")

  // Once the tour ends the dialog behaves normally again.
  await page.keyboard.press("Escape")
  await expect(popover).toHaveCount(0)
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
})
