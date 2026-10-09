import { expect, type Page, test } from "@playwright/test"

import { seeToursExcept } from "./support/auth"
import {
  browseAsGuest,
  CLARIFY_PANEL_ID,
  MANY_TABS_PANEL,
  mockClarificationChat,
  openConversationFromHistory,
} from "./support/chat"

async function expectNoHorizontalScroll(page: Page) {
  const [viewport, content] = await page.evaluate(() => [
    document.documentElement.clientWidth,
    document.documentElement.scrollWidth,
  ])
  expect(content).toBe(viewport)
}

test.beforeEach(async ({ page }, testInfo) => {
  // ui-rules.md: verify (and capture) at 375px and 1280px.
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ height: 812, width: 375 })
  }
  await browseAsGuest(page)
  await seeToursExcept(page, [])
})

// The open panel sits where the composer was: same width as the composer's form,
// at the bottom of the page (only the disclaimer below it).
// Width the conversation composer's form has in this layout: its container is the
// same element that now wraps the panel (border-t px-4 py-3 md:px-6, form max-w-3xl).
async function conversationComposerWidth(page: Page): Promise<number> {
  const container = page
    .getByRole("region", { name: "Câu hỏi bổ sung" })
    .locator("xpath=..")
  return container.evaluate((element) => {
    const style = getComputedStyle(element)
    const inner =
      element.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight)
    return Math.min(inner, 768)
  })
}

async function expectPanelInComposerSlot(
  page: Page,
  composerWidth: number
): Promise<void> {
  const card = page
    .getByRole("region", { name: "Câu hỏi bổ sung" })
    .locator("> div")
    .first()
  const box = await card.boundingBox()
  const viewport = page.viewportSize()
  expect(box).not.toBeNull()
  expect(viewport).not.toBeNull()
  if (!box || !viewport) return
  expect(Math.abs(box.width - composerWidth)).toBeLessThan(2)
  expect(viewport.height - (box.y + box.height)).toBeLessThan(80)
}

test("answers a three-tab panel and keeps the answer card after reload", async ({
  page,
}, testInfo) => {
  const server = await mockClarificationChat(page)
  await page.goto("/chat")

  const composer = page.getByRole("textbox", { name: "Tin nhắn gửi UniSage" })
  await composer.fill("Tính GPA giúp em")
  await page.keyboard.press("Enter")
  await expect(
    page.getByRole("region", { name: "Câu hỏi bổ sung" })
  ).toBeVisible()

  const panel = page.getByRole("region", { name: "Câu hỏi bổ sung" })
  await expect(panel).toBeVisible()
  // The panel takes the composer's place: same width, composer hidden.
  await expect(composer).toHaveCount(0)
  await expectPanelInComposerSlot(page, await conversationComposerWidth(page))
  const submit = panel.getByRole("button", { name: "Gửi câu trả lời" })
  await expect(submit).toBeDisabled()
  await expect(panel.getByText("Còn 3 câu")).toBeVisible()
  await expectNoHorizontalScroll(page)
  // Let the fade-in/transition settle before capturing.
  await page.waitForTimeout(400)
  await page.screenshot({
    path: testInfo.outputPath(
      `clarification-panel-${testInfo.project.name}.png`
    ),
  })

  await panel.getByRole("radio", { name: /K20/ }).click()
  await panel.getByRole("tab", { name: /Điểm CK/ }).click()
  await panel.getByLabel("Điểm cuối kỳ (thang 10)").fill("6,5")
  await panel.getByRole("tab", { name: /Các môn/ }).click()
  await panel.getByLabel("Môn 1: tên môn").fill("Toán")
  await panel.getByLabel("Môn 1: tín chỉ").fill("3")
  await panel.getByLabel("Môn 1: điểm").fill("8.5")
  await panel.getByRole("button", { name: "Thêm môn" }).click()
  await panel.getByLabel("Môn 2: tín chỉ").fill("2")
  await panel.getByLabel("Môn 2: điểm").fill("b+")
  await expectNoHorizontalScroll(page)
  // Let the fade-in/transition settle before capturing.
  await page.waitForTimeout(400)
  await page.screenshot({
    path: testInfo.outputPath(
      `clarification-panel-course-table-${testInfo.project.name}.png`
    ),
  })
  await expect(submit).toBeEnabled()
  await submit.click()

  await expect(panel).toHaveCount(0)
  expect(server.streamBodies.at(-1)).toEqual({
    clarification: {
      action: "submit",
      answers: [
        { option_id: "k20", question_id: "q1" },
        { number: "6.5", question_id: "q2" },
        {
          question_id: "q3",
          rows: [
            { credits: 3, name: "Toán", score: "8.5" },
            { credits: 2, name: null, score: "B+" },
          ],
        },
      ],
      panel_id: CLARIFY_PANEL_ID,
    },
    conversation_id: expect.any(String),
  })

  const card = page.getByRole("button", { name: "Đã trả lời · 3 câu hỏi" })
  await expect(card).toBeVisible()
  await expect(page.getByRole("table")).toContainText("Toán")
  await expect(page.getByText("GPA học kỳ của bạn là 3.2")).toBeVisible()
  await expect(composer).toBeEnabled()
  await expectNoHorizontalScroll(page)
  // Let the fade-in/transition settle before capturing.
  await page.waitForTimeout(400)
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath(
      `clarification-answered-${testInfo.project.name}.png`
    ),
  })

  await page.reload()
  await openConversationFromHistory(page, server.title)
  await expect(
    page.getByRole("button", { name: "Đã trả lời · 3 câu hỏi" })
  ).toBeVisible()
  await expect(page.getByRole("table")).toContainText("B+")
  await expect(
    page.getByRole("region", { name: "Câu hỏi bổ sung" })
  ).toHaveCount(0)
})

test("keeps an open panel across reload, then cancels it", async ({
  page,
}, testInfo) => {
  const server = await mockClarificationChat(page, { withOpenPanel: true })
  await page.goto("/chat")
  await openConversationFromHistory(page, server.title)

  const panel = page.getByRole("region", { name: "Câu hỏi bổ sung" })
  await expect(panel).toBeVisible()
  await panel.getByRole("radio", { name: /K19/ }).click()

  await page.reload()
  await openConversationFromHistory(page, server.title)
  await expect(panel).toBeVisible()
  // The draft comes back from sessionStorage.
  await expect(panel.getByRole("radio", { name: /K19/ })).toBeChecked()

  const composer = page.getByRole("textbox", { name: "Tin nhắn gửi UniSage" })
  await expect(composer).toHaveCount(0)

  await panel.getByRole("button", { name: "Huỷ câu hỏi" }).click()
  const dialog = page.getByRole("dialog", { name: "Huỷ câu hỏi?" })
  await expect(dialog).toBeVisible()
  await dialog.getByRole("button", { name: "Huỷ câu hỏi" }).click()

  await expect(panel).toHaveCount(0)
  await expect(composer).toBeEnabled()
  expect(server.streamBodies.at(-1)).toEqual({
    clarification: { action: "cancel", panel_id: CLARIFY_PANEL_ID },
    conversation_id: expect.any(String),
  })

  const cancelled = page.getByRole("button", { name: "Đã huỷ · 3 câu hỏi" })
  await expect(cancelled).toHaveAttribute("aria-expanded", "false")
  await cancelled.click()
  await expect(page.getByText("Bạn thuộc khoá nào?")).toBeVisible()
  // Let the fade-in/transition settle before capturing.
  await page.waitForTimeout(400)
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath(
      `clarification-cancelled-${testInfo.project.name}.png`
    ),
  })
})

test("answers a 15-tab panel with a number_or_list tab in both modes", async ({
  page,
}, testInfo) => {
  const server = await mockClarificationChat(page, { panel: MANY_TABS_PANEL })
  await page.goto("/chat")

  await page
    .getByRole("textbox", { name: "Tin nhắn gửi UniSage" })
    .fill("Tính điểm tổng kết giúp em")
  await page.keyboard.press("Enter")

  const panel = page.getByRole("region", { name: "Câu hỏi bổ sung" })
  await expect(panel.getByRole("tab")).toHaveCount(15)
  await expect(panel.getByText("Còn 15 câu")).toBeVisible()
  // Many tabs scroll inside the tab list, never the page.
  const tabList = panel.getByRole("tablist")
  expect(
    await tabList.evaluate((node) => node.scrollWidth > node.clientWidth)
  ).toBe(true)
  await expectNoHorizontalScroll(page)

  // Default mode: one input per column.
  await expect(
    panel.getByRole("button", { name: "Nhập từng cột" })
  ).toHaveAttribute("aria-pressed", "true")
  await panel.getByLabel("Điểm TX 1").fill("8")
  await panel.getByRole("button", { name: "Thêm", exact: true }).click()
  await panel.getByLabel("Điểm TX 2").fill("7")
  await panel.getByRole("button", { name: "Thêm", exact: true }).click()
  await panel.getByLabel("Điểm TX 3").fill("7")
  await page.waitForTimeout(400)
  await page.screenshot({
    path: testInfo.outputPath(
      `clarification-number-or-list-columns-${testInfo.project.name}.png`
    ),
  })

  await panel.getByRole("button", { name: "Nhập sẵn" }).click()
  await panel.getByLabel(/Điểm thường xuyên/).fill("7,3")
  await page.waitForTimeout(400)
  await page.screenshot({
    path: testInfo.outputPath(
      `clarification-number-or-list-single-${testInfo.project.name}.png`
    ),
  })

  for (let index = 2; index <= 15; index += 1) {
    await panel
      .getByRole("tab", { name: new RegExp(`^Môn ${index}\\b`) })
      .click()
    await panel.getByLabel(`Điểm môn thứ ${index}`).fill("8")
  }
  await expectNoHorizontalScroll(page)
  await panel.getByRole("button", { name: "Gửi câu trả lời" }).click()

  const answers = server.streamBodies.at(-1)?.clarification?.answers ?? []
  expect(answers).toHaveLength(15)
  // Only the active mode is sent.
  expect(answers[0]).toEqual({ number: "7.3", question_id: "q1" })
  await expect(
    page.getByRole("button", { name: "Đã trả lời · 15 câu hỏi" })
  ).toBeVisible()
  await expect(page.getByText("Nhập sẵn: 7.3")).toBeVisible()
})
