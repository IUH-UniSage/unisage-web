import { expect, test } from "@playwright/test"

import { seeToursExcept } from "./support/auth"
import { browseAsGuest, mockGuestChat } from "./support/chat"

// A calculation answer as the agent writes it: a $$ … $$ block per formula
// line, back to back, then the substituted values.
const ANSWER = [
  "Tổng điểm học bạ 3 môn tối thiểu phải là **25.5**.",
  "",
  "**Tổng điểm học bạ 3 môn (ĐHB) tối thiểu để XT1 ≥ 24**",
  "",
  "Công thức:",
  "",
  "$$ \\text{ĐK} = \\max(\\text{ĐTN},\\ \\text{ĐĐGNL}) $$",
  "$$ \\text{XT1} = 0{,}7 \\times \\text{ĐK} + 0{,}3 \\times \\text{ĐHB} + \\text{Đ(Kv;Đt)} + \\text{ĐC} $$",
  "",
  "Thay số: 0,7 × 23 + 0,3 × ĐHB + 0,25 ≥ 24 ⇒ ĐHB ≥ 25,5",
].join("\n")

test.beforeEach(async ({ page }, testInfo) => {
  // ui-rules.md: verify (and capture) at 375px and 1280px.
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ height: 812, width: 375 })
  }
  await browseAsGuest(page)
  await mockGuestChat(page)
  await seeToursExcept(page, [])
})

test("renders a formula block of the answer as math", async ({
  page,
}, testInfo) => {
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
                content: "Cần bao nhiêu điểm học bạ để XT1 đạt 24?",
                id: "7c1d2a90-1b2c-4d3e-8f40-5a6b7c8d9e11",
                role: "USER",
              },
              {
                ...base,
                content: ANSWER,
                id: "7c1d2a90-1b2c-4d3e-8f40-5a6b7c8d9e12",
                role: "ASSISTANT",
              },
            ]
          : [],
        message: "Successful",
      },
    })
  })
  await page.goto("/chat")

  await page
    .getByRole("textbox", { name: "Tin nhắn gửi UniSage" })
    .fill("Cần bao nhiêu điểm học bạ để XT1 đạt 24?")
  await page.keyboard.press("Enter")

  // Both lines render as KaTeX display math, not as raw "$$ \text{…} $$".
  await expect(page.locator(".katex-display")).toHaveCount(2)
  await expect(page.getByText("\\text{ĐK}")).toHaveCount(0)

  // A long formula scrolls inside its block instead of widening the page.
  const [viewport, content] = await page.evaluate(() => [
    document.documentElement.clientWidth,
    document.documentElement.scrollWidth,
  ])
  expect(content).toBe(viewport)
  // The answer fades in; capture it once the entrance animation is done.
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((animation) => animation.finished))
  )
  await page.screenshot({
    path: testInfo.outputPath(`chat-formula-${testInfo.project.name}.png`),
  })
})
