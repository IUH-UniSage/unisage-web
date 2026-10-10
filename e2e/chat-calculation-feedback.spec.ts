import { expect, test } from "@playwright/test"

import { seeToursExcept } from "./support/auth"
import {
  browseAsGuest,
  mockCalculationFeedbackChat,
  openConversationFromHistory,
} from "./support/chat"

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ height: 812, width: 375 })
  }
  await browseAsGuest(page)
  await seeToursExcept(page, [])
})

test("marks an AI-computed calculation wrong with a reason and keeps it after reload", async ({
  page,
}, testInfo) => {
  const server = await mockCalculationFeedbackChat(page)
  await page.goto("/chat")
  await openConversationFromHistory(page, server.title)

  // Only the AI-computed item gets buttons (T2 is builtin).
  const groups = page.getByRole("group", { name: /Phản hồi kết quả/ })
  await expect(groups).toHaveCount(1)
  const row = groups.first()
  await expect(row).toContainText("Kết quả AI tự tính ở trên có đúng không?")

  await row.getByRole("button", { name: "Sai" }).click()
  const send = page.getByRole("button", { name: "Gửi", exact: true })
  await expect(send).toBeDisabled()
  await page.getByRole("radio", { name: "Sai kết quả" }).click()
  await page.getByLabel(/Ghi chú/).fill("Thiếu phí bảo hiểm")
  await page.waitForTimeout(300)
  await page.screenshot({
    path: testInfo.outputPath(
      `calculation-feedback-popover-${testInfo.project.name}.png`
    ),
  })
  await send.click()

  await expect(page.getByText("Cảm ơn bạn đã phản hồi")).toBeVisible()
  expect(server.feedbackBodies).toEqual([
    {
      itemId: "T1",
      note: "Thiếu phí bảo hiểm",
      reason: "WRONG_RESULT",
      verdict: "WRONG",
    },
  ])
  await expect(row.getByRole("button", { name: "Sai" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )

  await page.reload()
  await openConversationFromHistory(page, server.title)
  const reloaded = page.getByRole("group", { name: /Phản hồi kết quả/ })
  await expect(reloaded.getByRole("button", { name: "Sai" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
  const [viewport, content] = await page.evaluate(() => [
    document.documentElement.clientWidth,
    document.documentElement.scrollWidth,
  ])
  expect(content).toBe(viewport)
  await page.waitForTimeout(400)
  await page.screenshot({
    path: testInfo.outputPath(
      `calculation-feedback-${testInfo.project.name}.png`
    ),
  })
})
