import { expect, test } from "@playwright/test"

import { authenticateAs } from "./support/auth"
import { mockDashboardSummary } from "./support/dashboard"

test("shows what needs attention, period KPIs and AI cost", async ({
  page,
}, testInfo) => {
  await authenticateAs(page, "SUPER_ADMIN")
  await mockDashboardSummary(page)
  await page.goto("/admin")

  await expect(
    page.getByRole("heading", { name: "Tổng quan hệ thống" })
  ).toBeVisible()
  await expect(page.getByText("Cần xử lý (3)")).toBeVisible()
  await expect(page.getByText("1 cảnh báo ngân sách")).toBeVisible()
  await expect(page.getByText("Câu trả lời AI", { exact: true })).toBeVisible()
  await expect(page.getByText("2,6 giây")).toBeVisible()
  await expect(
    page.getByRole("main").getByText("Chi phí AI", { exact: true })
  ).toBeVisible()
  await expect(page.getByText("Hệ thống · Hàng ngày")).toBeVisible()
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath(`admin-overview-${testInfo.project.name}.png`),
  })
})

test("keeps the chosen period in the URL and refetches for it", async ({
  page,
}) => {
  await authenticateAs(page, "SUPER_ADMIN")
  await mockDashboardSummary(page)
  await page.goto("/admin")

  const request = page.waitForRequest((req) =>
    req.url().includes("period=LAST_7_DAYS")
  )
  await page.getByRole("tab", { name: "7 ngày" }).click()
  await request
  await expect(page).toHaveURL(/period=LAST_7_DAYS/)
})
