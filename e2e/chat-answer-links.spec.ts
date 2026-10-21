import { expect, test } from "@playwright/test"

import { seeToursExcept } from "./support/auth"
import { browseAsGuest, mockGuestChat } from "./support/chat"

const PAGE_URL =
  "https://tuyensinh.iuh.edu.vn/diem-chuan-trung-tuyen-dai-hoc-chinh-quy-2026.html"

test.beforeEach(async ({ page }, testInfo) => {
  // ui-rules.md: verify (and capture) at 375px and 1280px.
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ height: 812, width: 375 })
  }
  await browseAsGuest(page)
  await mockGuestChat(page)
  await seeToursExcept(page, [])
})

test("opens a page the answer points to in a new tab", async ({
  context,
  page,
}, testInfo) => {
  // mockGuestChat's conversation, its answer pointing at official pages by
  // their bare address (the agent's web fallback does this).
  let answered = false
  page.on("request", (request) => {
    if (request.url().includes("/chat/stream")) answered = true
  })
  await page.route("**/messages/conversation/**", async (route) => {
    const base = {
      chatModelId: null,
      citations: null,
      conversationId: "4d0f7f4e-8a3b-4c55-9d2e-0c7a3e9b1a11",
      createdAt: new Date().toISOString(),
      metadata: null,
      retrievalScore: null,
      status: "COMPLETED",
      ticketId: null,
    }
    await route.fulfill({
      json: {
        code: 1000,
        data: answered
          ? [
              {
                ...base,
                content: "Điểm chuẩn ngành CNTT 2026?",
                id: "7c1d2a90-1b2c-4d3e-8f40-5a6b7c8d9e01",
                role: "USER",
              },
              {
                ...base,
                content: `Điểm chuẩn được công bố trên website tuyển sinh (ngày 20/08/2026) [1] . Bạn có thể xem điểm chuẩn tại các trang sau:\n\n- Điểm chuẩn trúng tuyển 2026: ${PAGE_URL}`,
                id: "7c1d2a90-1b2c-4d3e-8f40-5a6b7c8d9e02",
                role: "ASSISTANT",
              },
            ]
          : [],
        message: "Successful",
      },
    })
  })
  await context.route(PAGE_URL, (route) =>
    route.fulfill({ body: "<h1>Điểm chuẩn</h1>", contentType: "text/html" })
  )
  await page.goto("/chat")

  await page
    .getByRole("textbox", { name: "Tin nhắn gửi UniSage" })
    .fill("Điểm chuẩn ngành CNTT 2026?")
  await page.keyboard.press("Enter")

  const link = page.getByRole("link", { name: PAGE_URL })
  await expect(link).toBeVisible()

  // The long address wraps instead of widening the page.
  const [viewport, content] = await page.evaluate(() => [
    document.documentElement.clientWidth,
    document.documentElement.scrollWidth,
  ])
  expect(content).toBe(viewport)
  await page.screenshot({
    path: testInfo.outputPath(`chat-answer-link-${testInfo.project.name}.png`),
  })

  const [opened] = await Promise.all([
    context.waitForEvent("page"),
    link.click(),
  ])
  await expect(opened).toHaveURL(PAGE_URL)
  await expect(page).toHaveURL(/\/chat/)
})
