import { expect, test } from "@playwright/test"

import { seeToursExcept } from "./support/auth"
import { browseAsGuest, mockGuestChat } from "./support/chat"

test("introduces the home page to a first-time guest", async ({
  page,
}, testInfo) => {
  await browseAsGuest(page)
  await page.goto("/")

  const popover = page.locator(".driver-popover")
  const title = popover.locator(".driver-popover-title")
  await expect(title).toHaveText("Chào mừng đến UniSage")

  await popover.getByRole("button", { name: "Tiếp" }).click()
  await expect(title).toHaveText("Đặt câu hỏi")
  await page.waitForTimeout(400)
  await page.screenshot({
    path: testInfo.outputPath(`client-tour-home-${testInfo.project.name}.png`),
  })

  await popover.getByRole("button", { name: "Bỏ qua" }).click()
  await expect(popover).toHaveCount(0)

  // Seen: a reload stays quiet, the header ? replays it.
  await page.reload()
  await expect(page.getByRole("textbox", { name: "Hỏi UniSage" })).toBeVisible()
  await page.waitForTimeout(1_000)
  await expect(popover).toHaveCount(0)
  await page
    .getByRole("button", { name: "Hướng dẫn sử dụng trang này" })
    .click()
  await expect(title).toHaveText("Chào mừng đến UniSage")
})

test("tours the chat for a guest, then explains the first answer", async ({
  page,
}, testInfo) => {
  await browseAsGuest(page)
  await mockGuestChat(page)
  await seeToursExcept(page, ["page:chat", "page:chat-reply"])
  await page.goto("/chat")

  const popover = page.locator(".driver-popover")
  const title = popover.locator(".driver-popover-title")
  await expect(title).toHaveText("Hỏi trợ lý")
  await page.waitForTimeout(400)
  await page.screenshot({
    path: testInfo.outputPath(`client-tour-chat-${testInfo.project.name}.png`),
  })

  // Guests see the sign-in prompt, never the signed-in account step.
  const titles: string[] = []
  const nextButton = popover.locator(".driver-popover-next-btn")
  for (let step = 0; step < 10; step += 1) {
    titles.push((await title.textContent()) ?? "")
    if ((await nextButton.textContent()) === "Hoàn tất") break
    await nextButton.click()
    await expect(title).not.toHaveText(titles.at(-1) ?? "")
  }
  expect(titles).not.toContain("Tài khoản")
  if (testInfo.project.name === "desktop-chromium") {
    expect(titles).toContain("Đăng nhập để lưu lại")
  }
  await nextButton.click()
  await expect(popover).toHaveCount(0)

  // The reply tour waits for the first finished answer.
  await page
    .getByRole("textbox", { name: "Tin nhắn gửi UniSage" })
    .fill("Điều kiện tốt nghiệp là gì?")
  await page.keyboard.press("Enter")
  await expect(title).toHaveText("Nguồn của câu trả lời")
  await page.waitForTimeout(400)
  await page.screenshot({
    path: testInfo.outputPath(
      `client-tour-chat-reply-${testInfo.project.name}.png`
    ),
  })
  await popover.getByRole("button", { name: "Tiếp" }).click()
  await expect(title).toHaveText("Sao chép hoặc báo cáo")
})
