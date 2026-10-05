import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"

import { authenticateAs } from "./support/auth"

async function openHeaderSearch(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole("button", { name: "Tìm kiếm" }).click()
  }
  return page.getByRole("combobox", { name: "Tìm trong không gian làm việc" })
}

test("jumps to a tab inside a page from the header search", async ({
  page,
}, testInfo) => {
  const isMobile = testInfo.project.name === "mobile-chromium"
  await authenticateAs(page, "SUPER_ADMIN")
  await page.goto("/admin")

  const search = await openHeaderSearch(page, isMobile)
  await search.fill("ngan sach")

  const option = page.getByRole("option", { name: /Chi phí AI.*Ngân sách/ })
  await expect(option).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath(`workspace-search-${testInfo.project.name}.png`),
  })

  await search.press("Enter")
  await expect(page).toHaveURL(/\/admin\/cost-management\?tab=budgets$/)
  await expect(page.getByRole("tab", { name: "Ngân sách" })).toHaveAttribute(
    "aria-selected",
    "true"
  )
})

test("only finds pages the user is permitted to open", async ({
  page,
}, testInfo) => {
  const isMobile = testInfo.project.name === "mobile-chromium"
  await authenticateAs(page, "SUPER_ADMIN", ["USER_READ"])
  await page.goto("/admin")

  const search = await openHeaderSearch(page, isMobile)
  await search.fill("chi phi")
  await expect(page.getByText(/Không tìm thấy mục nào khớp/)).toBeVisible()

  await search.fill("user")
  await expect(
    page.getByRole("option", { name: "Quản lý người dùng" })
  ).toBeVisible()
})
