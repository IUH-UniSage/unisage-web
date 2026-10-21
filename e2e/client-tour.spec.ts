import { expect, test } from "@playwright/test"

import { authenticateAs } from "./support/auth"
import { browseAsGuest, mockGuestChat } from "./support/chat"

test("walks a first-time student from home into the chat", async ({
  page,
}, testInfo) => {
  await authenticateAs(page, "USER", undefined, { productTours: true })
  await mockGuestChat(page)
  await page.goto("/")

  const popover = page.locator(".driver-popover")
  const title = popover.locator(".driver-popover-title")
  await expect(title).toHaveText("Chào mừng đến UniSage")
  await expect(popover.locator(".driver-popover-progress-text")).toContainText(
    "Trang 1/3"
  )

  // The last step of the home page hands over to the chat page.
  const nextButton = popover.locator(".driver-popover-next-btn")
  for (let step = 0; step < 10; step += 1) {
    if ((await nextButton.textContent()) === "Tiếp: Trợ lý") break
    const currentTitle = (await title.textContent()) ?? ""
    await nextButton.click()
    await expect(title).not.toHaveText(currentTitle)
  }
  await page.waitForTimeout(400)
  await page.screenshot({
    path: testInfo.outputPath(
      `client-tour-handover-${testInfo.project.name}.png`
    ),
  })
  await nextButton.click()

  await expect(page).toHaveURL(/\/chat$/)
  await expect(title).toHaveText("Hỏi trợ lý")
  await expect(popover.locator(".driver-popover-progress-text")).toContainText(
    "Trang 2/3"
  )

  // Skipping ends it for good, even mid-way.
  await popover.getByRole("button", { name: "Bỏ qua" }).click()
  await expect(popover).toHaveCount(0)
  await page.goto("/")
  await expect(page.getByRole("textbox", { name: "Hỏi UniSage" })).toBeVisible()
  await page.waitForTimeout(1_000)
  await expect(popover).toHaveCount(0)
})

test("never auto-starts for a guest; the header ? runs the page tour", async ({
  page,
}) => {
  await browseAsGuest(page)
  await page.goto("/")

  const popover = page.locator(".driver-popover")
  await expect(page.getByRole("textbox", { name: "Hỏi UniSage" })).toBeVisible()
  await page.waitForTimeout(1_000)
  await expect(popover).toHaveCount(0)

  await page
    .getByRole("button", { name: "Hướng dẫn sử dụng trang này" })
    .click()
  await expect(popover.locator(".driver-popover-title")).toHaveText(
    "Chào mừng đến UniSage"
  )
})

test("explains the answer at the end of the chat tour once there is one", async ({
  page,
}, testInfo) => {
  await browseAsGuest(page)
  await mockGuestChat(page)
  await page.goto("/chat")

  await page
    .getByRole("textbox", { name: "Tin nhắn gửi UniSage" })
    .fill("Điều kiện tốt nghiệp là gì?")
  await page.keyboard.press("Enter")
  await expect(
    page.getByRole("button", { name: /Sao chép/ }).first()
  ).toBeVisible()

  const popover = page.locator(".driver-popover")
  const title = popover.locator(".driver-popover-title")
  await page
    .getByRole("button", { name: "Hướng dẫn sử dụng trang này" })
    .first()
    .click()
  await expect(title).toHaveText("Hỏi trợ lý")

  // Guests see the sign-in prompt, never the signed-in account step.
  const titles: string[] = []
  const nextButton = popover.locator(".driver-popover-next-btn")
  for (let step = 0; step < 12; step += 1) {
    titles.push((await title.textContent()) ?? "")
    if ((await nextButton.textContent()) === "Hoàn tất") break
    await nextButton.click()
    await expect(title).not.toHaveText(titles.at(-1) ?? "")
  }
  expect(titles).not.toContain("Tài khoản")
  expect(titles).toContain("Nguồn của câu trả lời")
  expect(titles).toContain("Sao chép hoặc báo cáo")
  await page.screenshot({
    path: testInfo.outputPath(
      `client-tour-chat-reply-${testInfo.project.name}.png`
    ),
  })
})
