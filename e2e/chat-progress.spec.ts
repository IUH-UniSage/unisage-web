import { expect, test } from "@playwright/test"

import { seeToursExcept } from "./support/auth"
import { browseAsGuest, mockGuestChat } from "./support/chat"

const PAGE_URL = "https://pdt.iuh.edu.vn/thong-bao/hoc-phi-2026-2027"

// A turn caught mid-way: the stream has said what it is doing but not
// finished (a fulfilled route would deliver the whole body at once), so
// `fetch` for the chat stream answers with a body that stays open.
async function streamThatStaysOnWebSearch(
  page: import("@playwright/test").Page
) {
  await page.addInitScript((pageUrl) => {
    const realFetch = window.fetch.bind(window)
    window.fetch = (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url
      if (!url.includes("/chat/stream")) return realFetch(input, init)
      const encoder = new TextEncoder()
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          for (const status of [
            { stage: "analyzing" },
            { stage: "retrieving" },
            { stage: "web_searching" },
            { stage: "web_searching", url: pageUrl },
          ]) {
            controller.enqueue(
              encoder.encode(
                `event: status\ndata: ${JSON.stringify(status)}\n\n`
              )
            )
          }
        },
      })
      return Promise.resolve(
        new Response(body, { headers: { "Content-Type": "text/event-stream" } })
      )
    }
  }, PAGE_URL)
}

test.beforeEach(async ({ page }, testInfo) => {
  // ui-rules.md: verify (and capture) at 375px and 1280px.
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ height: 812, width: 375 })
  }
  await browseAsGuest(page)
  await mockGuestChat(page)
  await seeToursExcept(page, [])
})

test("shows what the turn is doing and how long it has run", async ({
  page,
}, testInfo) => {
  await streamThatStaysOnWebSearch(page)
  await page.goto("/chat")

  await page
    .getByRole("textbox", { name: "Tin nhắn gửi UniSage" })
    .fill("Học phí ngành CNTT năm nay?")
  await page.keyboard.press("Enter")

  await expect(page.getByRole("status")).toHaveText(
    "Đang tìm kiếm trên pdt.iuh.edu.vn/thong-bao/hoc-phi-2026-2027"
  )
  const clock = page.getByText(/^\d+,\ds$/)
  await expect(clock).toBeVisible()
  // It counts up.
  await expect(clock).not.toHaveText("0,0s")
  await expect(clock).toHaveText(/^[1-9]\d*,\ds$/, { timeout: 3_000 })

  const [viewport, content] = await page.evaluate(() => [
    document.documentElement.clientWidth,
    document.documentElement.scrollWidth,
  ])
  expect(content).toBe(viewport)
  await page.screenshot({
    path: testInfo.outputPath(`chat-progress-${testInfo.project.name}.png`),
  })
})
