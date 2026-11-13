import { expect, test, type Page } from "@playwright/test"

import { authenticateAs } from "./support/auth"
import { mockRbac } from "./support/rbac"

// Shared admin list behaviour, exercised on the roles list (mockRbac: SUPER_ADMIN and INGEST_ADMIN
// are active, VIEWER is inactive).
// Desktop table and mobile cards both render a checkbox per row; target the visible one.
const rowCheckbox = (page: Page, name: string) =>
  page.getByLabel(`Chọn ${name}`).filter({ visible: true })

test.beforeEach(async ({ page }) => {
  await authenticateAs(page, "SUPER_ADMIN")
  await mockRbac(page)
})

test("pressing Enter in the search box applies the filter", async ({
  page,
}) => {
  await page.goto("/admin/rbac")
  await expect(rowCheckbox(page, "SUPER_ADMIN")).toBeVisible()

  await page.getByLabel("Tìm tên vai trò").fill("viewer")
  await page.getByLabel("Tìm tên vai trò").press("Enter")

  await expect(page).toHaveURL(/rq=viewer/)
  await expect(rowCheckbox(page, "VIEWER")).toBeVisible()
  await expect(rowCheckbox(page, "SUPER_ADMIN")).toHaveCount(0)
})

test("bulk bar only offers the actions that apply to the selection", async ({
  page,
}) => {
  await page.goto("/admin/rbac")
  const deactivate = page.getByRole("button", { name: "Vô hiệu hóa" })
  const recover = page.getByRole("button", { name: "Khôi phục" })

  await rowCheckbox(page, "SUPER_ADMIN").check()
  await expect(page.getByText("Đã chọn 1 mục")).toBeVisible()
  await expect(deactivate).toBeVisible()
  await expect(recover).toHaveCount(0)

  await rowCheckbox(page, "VIEWER").check()
  await expect(deactivate).toBeVisible()
  await expect(recover).toBeVisible()

  await rowCheckbox(page, "SUPER_ADMIN").uncheck()
  await expect(deactivate).toHaveCount(0)
  await expect(recover).toBeVisible()
})

test("cancelling an edit returns to the list, not the detail page", async ({
  page,
}) => {
  await page.goto("/admin/rbac/976398bd-c8ac-4fa8-803e-0a91e207347c/edit")

  await page.getByRole("button", { name: "Hủy" }).first().click()

  await expect(page).toHaveURL(/\/admin\/rbac$/)
})
