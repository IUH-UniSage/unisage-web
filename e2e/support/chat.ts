import type { Page } from "@playwright/test"

const CONVERSATION_ID = "4d0f7f4e-8a3b-4c55-9d2e-0c7a3e9b1a11"
const ANSWER =
  "Sinh viên cần tích lũy đủ số tín chỉ của chương trình đào tạo và đạt chuẩn đầu ra ngoại ngữ."

// A guest session: no refresh cookie, so the app settles on
// "unauthenticated" instead of reaching a real backend.
export async function browseAsGuest(page: Page) {
  await page.route("**/api/v1/master/auth/refresh", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: { code: 1401, message: "Unauthenticated" },
      status: 401,
    })
  })
}

// One guest conversation whose first question gets a cited answer.
export async function mockGuestChat(page: Page) {
  const createdAt = new Date().toISOString()
  let answered = false

  // No quota warning in the way of the composer.
  await page.route("**/usage-limits/me", async (route) => {
    await route.fulfill({
      json: { code: 1000, data: null, message: "Successful" },
    })
  })
  await page.route("**/conversations/guest", async (route) => {
    await route.fulfill({
      json: { code: 1000, data: [], message: "Successful" },
    })
  })
  await page.route("**/conversations", async (route) => {
    await route.fulfill({
      json: {
        code: 1000,
        data: {
          createdAt,
          id: CONVERSATION_ID,
          title: "Điều kiện tốt nghiệp",
          userId: null,
        },
        message: "Successful",
      },
    })
  })
  await page.route("**/chat/stream", async (route) => {
    answered = true
    await route.fulfill({
      body: [
        `event: token\ndata: ${JSON.stringify(ANSWER)}\n\n`,
        "event: done\ndata: {}\n\n",
      ].join(""),
      contentType: "text/event-stream",
    })
  })
  await page.route("**/messages/conversation/**", async (route) => {
    const base = {
      chatModelId: null,
      conversationId: CONVERSATION_ID,
      createdAt,
      metadata: null,
      retrievalScore: null,
      ticketId: null,
    }
    await route.fulfill({
      json: {
        code: 1000,
        data: answered
          ? [
              {
                ...base,
                citations: null,
                content: "Điều kiện tốt nghiệp là gì?",
                id: "7c1d2a90-1b2c-4d3e-8f40-5a6b7c8d9e01",
                role: "USER",
                status: "COMPLETED",
              },
              {
                ...base,
                citations: [
                  {
                    documentId: "doc-1",
                    index: 1,
                    title: "Quy chế đào tạo đại học",
                  },
                ],
                content: `${ANSWER} [1]`,
                id: "7c1d2a90-1b2c-4d3e-8f40-5a6b7c8d9e02",
                role: "ASSISTANT",
                status: "COMPLETED",
              },
            ]
          : [],
        message: "Successful",
      },
    })
  })
}

// ---------------------------------------------------------------------------
// Clarification panel (unisage-agent contracts/chat-sse.md): a small stateful
// fake of the agent + backend, so a reload sees what the "server" stored.

const CLARIFY_CONVERSATION_ID = "5e1a8f20-7b3c-4d4e-9f50-1a2b3c4d5e60"
const CLARIFY_TITLE = "Tính GPA học kỳ"
export const CLARIFY_PANEL_ID = "7f1c2a9e-1111-4000-8000-000000000099"

export const CLARIFY_PANEL = {
  panel_id: CLARIFY_PANEL_ID,
  questions: [
    {
      allow_other: true,
      id: "q1",
      kind: "choice",
      max_items: null,
      max_length: null,
      number: null,
      options: [
        { description: null, id: "k19", label: "K19", recommended: false },
        {
          description: "Nhập học 2020",
          id: "k20",
          label: "K20",
          recommended: true,
        },
      ],
      prompt: "Bạn thuộc khoá nào?",
      tab_label: "Khoá",
    },
    {
      allow_other: false,
      id: "q2",
      kind: "number",
      max_items: null,
      max_length: null,
      number: { max: "10", min: "0", step: "0.01", unit: null },
      options: [],
      prompt: "Điểm cuối kỳ (thang 10)",
      tab_label: "Điểm CK",
    },
    {
      allow_other: false,
      id: "q3",
      kind: "course_table",
      max_items: 30,
      max_length: null,
      number: null,
      options: [],
      prompt: "Nhập các môn để tính GPA",
      tab_label: "Các môn",
    },
  ],
  schema_version: 1,
} as const

type MockMessage = Record<string, unknown> & { metadata: unknown }
type StreamBody = {
  clarification?: {
    action: "cancel" | "submit"
    answers?: Array<Record<string, unknown>>
    panel_id: string
  }
  conversation_id: string
  message?: string
}

function sse(events: Array<[string, unknown]>): string {
  return events
    .map(
      ([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    )
    .join("")
}

// What the agent stores on the USER message of a submit (contract §5).
function answeredCard(answers: Array<Record<string, unknown>>) {
  return {
    items: CLARIFY_PANEL.questions.map((question) => {
      const answer = answers.find((it) => it.question_id === question.id) ?? {}
      const base = {
        kind: question.kind,
        prompt: question.prompt,
        question_id: question.id,
        tab_label: question.tab_label,
      }
      if (question.kind === "choice") {
        const option = question.options.find((it) => it.id === answer.option_id)
        return {
          ...base,
          display: option?.label ?? String(answer.other_text ?? ""),
          option_id: option?.id ?? null,
        }
      }
      if (question.kind === "course_table") {
        return { ...base, display: null, rows: answer.rows }
      }
      return { ...base, display: String(answer.number ?? "") }
    }),
    panel_id: CLARIFY_PANEL_ID,
    schema_version: 1,
  }
}

/**
 * `withOpenPanel`: the conversation already exists and ends with an open
 * panel (as after a reload). Otherwise the first message opens one.
 */
export async function mockClarificationChat(
  page: Page,
  { withOpenPanel = false }: { withOpenPanel?: boolean } = {}
) {
  const createdAt = new Date().toISOString()
  const streamBodies: StreamBody[] = []
  const messages: MockMessage[] = []
  let conversationExists = withOpenPanel

  const message = (fields: Record<string, unknown>): MockMessage => ({
    chatModelId: null,
    citations: null,
    conversationId: CLARIFY_CONVERSATION_ID,
    createdAt,
    id: crypto.randomUUID(),
    metadata: null,
    retrievalScore: null,
    status: "COMPLETED",
    ticketId: null,
    ...fields,
  })
  const askWithPanel = (question: string) => {
    messages.push(message({ content: question, role: "USER" }))
    messages.push(
      message({
        content: "Mình cần thêm vài thông tin để tính GPA.",
        metadata: {
          clarification: {
            panel: CLARIFY_PANEL,
            schema_version: 1,
            status: "open",
          },
        },
        role: "ASSISTANT",
      })
    )
  }
  if (withOpenPanel) askWithPanel("Tính GPA giúp em")

  await page.route("**/usage-limits/me", async (route) => {
    await route.fulfill({
      json: { code: 1000, data: null, message: "Successful" },
    })
  })
  const conversation = {
    createdAt,
    id: CLARIFY_CONVERSATION_ID,
    title: CLARIFY_TITLE,
    userId: null,
  }
  await page.route("**/conversations/guest", async (route) => {
    await route.fulfill({
      json: {
        code: 1000,
        data: conversationExists ? [conversation] : [],
        message: "Successful",
      },
    })
  })
  await page.route("**/conversations", async (route) => {
    conversationExists = true
    await route.fulfill({
      json: { code: 1000, data: conversation, message: "Successful" },
    })
  })
  await page.route("**/messages/conversation/**", async (route) => {
    await route.fulfill({
      json: { code: 1000, data: messages, message: "Successful" },
    })
  })
  await page.route("**/chat/stream", async (route) => {
    const body = route.request().postDataJSON() as StreamBody
    streamBodies.push(body)
    const lastAssistant = messages.at(-1)

    if (body.message !== undefined) {
      askWithPanel(body.message)
      await route.fulfill({
        body: sse([
          ["token", "Mình cần thêm vài thông tin để tính GPA."],
          ["clarification", CLARIFY_PANEL],
          ["done", {}],
        ]),
        contentType: "text/event-stream",
      })
      return
    }

    if (body.clarification?.action === "cancel") {
      if (lastAssistant) {
        lastAssistant.metadata = {
          clarification: {
            panel: CLARIFY_PANEL,
            schema_version: 1,
            status: "cancelled",
          },
        }
      }
      await route.fulfill({
        body: sse([
          [
            "clarification_closed",
            { panel_id: CLARIFY_PANEL_ID, status: "cancelled" },
          ],
          ["done", {}],
        ]),
        contentType: "text/event-stream",
      })
      return
    }

    const answers = body.clarification?.answers ?? []
    const reply = "GPA học kỳ của bạn là 3.2 (thang 4)."
    messages.push(
      message({
        content: "Khoá: K20\nĐiểm CK: 6.5\nCác môn: 2 môn",
        metadata: { clarification_answers: answeredCard(answers) },
        role: "USER",
      })
    )
    messages.push(message({ content: reply, role: "ASSISTANT" }))
    await route.fulfill({
      body: sse([
        ["token", reply],
        ["done", {}],
      ]),
      contentType: "text/event-stream",
    })
  })

  return { streamBodies, title: CLARIFY_TITLE }
}

// After a reload the chat starts empty; reopen the conversation from history
// (a sheet on mobile, the sidebar on desktop).
export async function openConversationFromHistory(page: Page, title: string) {
  await page
    .getByRole("textbox", { name: "Tin nhắn gửi UniSage" })
    .waitFor({ state: "visible" })
  const toggle = page.getByRole("button", { name: "Mở lịch sử trò chuyện" })
  if (!(await toggle.isVisible())) {
    await page.getByRole("button", { name: title, exact: true }).click()
    return
  }
  await toggle.click()
  const sheet = page.getByRole("dialog", { name: "Lịch sử trò chuyện" })
  await sheet.getByRole("button", { name: title, exact: true }).click()
  // Picking a conversation leaves the sheet open on mobile.
  await sheet.getByRole("button", { name: "Đóng" }).click()
  await sheet.waitFor({ state: "hidden" })
}
