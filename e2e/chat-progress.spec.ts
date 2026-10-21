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

test("shows the stored response time at the right of the answer's actions", async ({
  page,
}, testInfo) => {
  // mockGuestChat's conversation, its answer stored with the turn's response time.
  let answered = false
  page.on("request", (request) => {
    if (request.url().includes("/chat/stream")) answered = true
  })
  await page.route("**/messages/conversation/**", async (route) => {
    const createdAt = new Date().toISOString()
    const base = {
      chatModelId: null,
      citations: null,
      conversationId: "4d0f7f4e-8a3b-4c55-9d2e-0c7a3e9b1a11",
      createdAt,
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
                content: "Điều kiện tốt nghiệp là gì?",
                id: "7c1d2a90-1b2c-4d3e-8f40-5a6b7c8d9e01",
                metadata: null,
                role: "USER",
              },
              {
                ...base,
                content:
                  "Sinh viên cần tích lũy đủ số tín chỉ của chương trình.",
                id: "7c1d2a90-1b2c-4d3e-8f40-5a6b7c8d9e02",
                metadata: null,
                responseTimeMs: 16240,
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
    .fill("Điều kiện tốt nghiệp là gì?")
  await page.keyboard.press("Enter")

  const total = page.getByText("16,24s", { exact: true })
  await expect(total).toBeVisible()
  // On the actions' row, at its right edge (as far right as the answer).
  const report = page
    .getByRole("button", { name: "Báo cáo câu trả lời này" })
    .last()
  const [totalBox, reportBox] = await Promise.all([
    total.boundingBox(),
    report.boundingBox(),
  ])
  const answerBox = await page
    .getByText("Sinh viên cần tích lũy đủ số tín chỉ của chương trình.")
    .boundingBox()
  expect(totalBox && reportBox && totalBox.x > reportBox.x + 40).toBe(true)
  expect(
    totalBox &&
      reportBox &&
      Math.abs(totalBox.y - reportBox.y) < reportBox.height
  ).toBe(true)
  expect(answerBox).not.toBeNull()
  await page.screenshot({
    path: testInfo.outputPath(
      `chat-response-time-${testInfo.project.name}.png`
    ),
  })
})
