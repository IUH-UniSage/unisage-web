import { expect, type Page, test } from "@playwright/test"

import { authenticateAs, seeToursExcept } from "./support/auth"
import { browseAsGuest } from "./support/chat"

// UNISAGE-107 conversation sharing, against mocked /api/v1/master routes (the
// same approach as the other chat specs). Spec: unisage-backend/changes/
// 02-11-2026-Conversation-Sharing/spec.md §5.2, §5.5, §11.

const TOKEN = "Zm9vYmFyLXRva2VuLXVybC1zYWZlXzEyMzQ1Njc4OTA"
const ORIGINAL_ID = "0f8fad5b-d9cb-469f-a165-70867728950e"
const COPY_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7"
const SHARE_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301"
const USER_ID = "a76398bd-c8ac-4fa8-803e-0a91e207347c"
const TITLE = "Hỏi về học phí"
const createdAt = "2026-11-02T03:00:00Z"

const ok = (data: unknown) => ({ code: 1000, data, message: "Successful" })

const snapshotMessages = [
  {
    citations: null,
    content: "Học phí học kỳ này là bao nhiêu?",
    createdAt,
    id: "1b4e28ba-2fa1-41d2-883f-0016d3cca427",
    metadata: null,
    role: "USER",
  },
  {
    citations: [
      {
        documentId: "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b",
        index: 1,
        pageStart: 3,
        title: "Quy định học phí 2026",
      },
    ],
    content: "Học phí là 450.000đ một tín chỉ [1].",
    createdAt,
    id: "9a1c7c3e-4e7c-4d4b-8c39-3a1f0e5c2b11",
    metadata: null,
    role: "ASSISTANT",
  },
]

function path(suffix: string) {
  return (url: URL) => url.pathname.endsWith(suffix)
}

async function mockChatBasics(page: Page, conversations: object[]) {
  await page.route("**/usage-limits/me", (route) =>
    route.fulfill({ json: ok(null) })
  )
  await page.route(path("/conversations"), (route) =>
    route.fulfill({ json: ok(conversations) })
  )
  await page.route("**/messages/conversation/**", (route) => {
    const conversationId = new URL(route.request().url()).pathname
      .split("/")
      .at(-1)
    return route.fulfill({
      json: ok(
        snapshotMessages.map((message) => ({
          ...message,
          chatModelId: null,
          conversationId,
          responseTimeMs: null,
          retrievalScore: null,
          status: "COMPLETED",
          ticketId: null,
        }))
      ),
    })
  })
}

async function mockSnapshot(page: Page, body: object, status = 200) {
  await page.route(path(`/shares/view/${TOKEN}`), (route) =>
    route.fulfill({ json: body, status })
  )
}

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ height: 812, width: 375 })
  }
})

test("a signed-out recipient signs in, lands back on the link and continues", async ({
  page,
}, testInfo) => {
  await browseAsGuest(page)
  await seeToursExcept(page, [])
  await page.route("**/api/v1/master/auth/login", (route) =>
    route.fulfill({
      json: ok({
        accessToken: [
          Buffer.from('{"alg":"none"}').toString("base64url"),
          Buffer.from(JSON.stringify({ sub: USER_ID })).toString("base64url"),
          "signature",
        ].join("."),
        avatarUrl: null,
        code: "SV002",
        email: "sv002@example.edu.vn",
        fullName: "Lê Thu Hà",
        isSystemRole: false,
        permissions: [],
        refreshToken: "refresh-token",
        refreshTokenExpirationMs: 60_000,
        role: "USER",
      }),
    })
  )
  await mockSnapshot(
    page,
    ok({ createdAt, isOwner: false, messages: snapshotMessages, title: TITLE })
  )
  let continued = 0
  await page.route(path(`/shares/view/${TOKEN}/continue`), (route) => {
    continued += 1
    return route.fulfill({ json: ok({ conversationId: COPY_ID }) })
  })
  await mockChatBasics(page, [
    {
      createdAt,
      id: COPY_ID,
      sourceShareId: SHARE_ID,
      title: TITLE,
      userId: USER_ID,
    },
  ])

  await page.goto(`/share/${TOKEN}`)
  await expect(page).toHaveURL(/\/login$/)
  await page.getByLabel("Mã sinh viên hoặc mã giảng viên").fill("SV002")
  await page.getByRole("textbox", { name: "Mật khẩu" }).fill("Secret@123")
  await page.getByRole("button", { name: "Đăng nhập" }).click()

  await expect(page).toHaveURL(new RegExp(`/share/${TOKEN}$`))
  await expect(page.getByRole("heading", { name: TITLE })).toBeVisible()
  await expect(page.getByText(/Hội thoại được chia sẻ · /)).toBeVisible()
  await expect(page.getByLabel("Tin nhắn gửi UniSage")).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Báo cáo câu trả lời này" })
  ).toHaveCount(0)
  const pageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth
  )
  expect(pageWidth).toBe(page.viewportSize()?.width)
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath(`share-snapshot-${testInfo.project.name}.png`),
  })

  await page.getByRole("button", { name: "Tiếp tục cuộc trò chuyện" }).click()
  await expect(page).toHaveURL(new RegExp(`/chat/${COPY_ID}$`))
  await expect(
    page.getByText("Tiếp tục từ hội thoại được chia sẻ")
  ).toBeVisible()
  expect(continued).toBe(1)
})

test("a citation the viewer may not open shows the soft notice", async ({
  page,
}) => {
  await authenticateAs(page)
  await mockSnapshot(
    page,
    ok({ createdAt, isOwner: false, messages: snapshotMessages, title: TITLE })
  )
  await page.route("**/documents/*/citation", (route) =>
    route.fulfill({
      json: { code: 2312, data: null, message: "RAW BACKEND MESSAGE" },
      status: 403,
    })
  )

  await page.goto(`/share/${TOKEN}`)
  await page.getByRole("button", { name: /Quy định học phí 2026/ }).click()

  await expect(
    page.getByRole("dialog").getByText("Bạn không có quyền xem tài liệu này.")
  ).toBeVisible()
  await expect(page.getByText("RAW BACKEND MESSAGE")).toHaveCount(0)
})

test("the owner opens the original conversation", async ({ page }) => {
  await authenticateAs(page)
  await mockSnapshot(
    page,
    ok({
      conversationId: ORIGINAL_ID,
      createdAt,
      isOwner: true,
      messages: snapshotMessages,
      title: TITLE,
    })
  )
  await mockChatBasics(page, [
    { createdAt, id: ORIGINAL_ID, title: TITLE, userId: USER_ID },
  ])

  await page.goto(`/share/${TOKEN}`)
  await expect(
    page.getByRole("button", { name: "Tiếp tục cuộc trò chuyện" })
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Mở hội thoại gốc" }).click()

  await expect(page).toHaveURL(new RegExp(`/chat/${ORIGINAL_ID}$`))
})

test("a revoked link shows the friendly empty state", async ({
  page,
}, testInfo) => {
  await authenticateAs(page)
  await mockSnapshot(
    page,
    { code: 2801, data: null, message: "RAW BACKEND MESSAGE" },
    404
  )

  await page.goto(`/share/${TOKEN}`)

  await expect(
    page.getByRole("heading", {
      name: "Liên kết không tồn tại hoặc đã bị thu hồi",
    })
  ).toBeVisible()
  await expect(page.getByText("RAW BACKEND MESSAGE")).toHaveCount(0)
  await page.screenshot({
    path: testInfo.outputPath(`share-not-found-${testInfo.project.name}.png`),
  })
  await page.getByRole("button", { name: "Về trang trò chuyện" }).click()
  await expect(page).toHaveURL(/\/chat$/)
})

test("the owner shares a conversation from the chat header", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chromium",
    "the header button is the desktop entry point; mobile has an icon"
  )
  await authenticateAs(page)
  await mockChatBasics(page, [
    { createdAt, id: ORIGINAL_ID, title: TITLE, userId: USER_ID },
  ])
  let body: unknown
  await page.route(path("/shares"), async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({
      json: ok({
        createdAt,
        id: SHARE_ID,
        messageCount: 2,
        title: TITLE,
        token: TOKEN,
      }),
      status: 201,
    })
  })

  await page.goto(`/chat/${ORIGINAL_ID}`)
  await page.getByRole("button", { name: "Chia sẻ đoạn chat" }).click()
  const dialog = page.getByRole("dialog", { name: "Chia sẻ đoạn chat" })
  await expect(
    dialog.getByText("Người nhận cần đăng nhập.", { exact: false })
  ).toBeVisible()
  await dialog.getByRole("button", { name: "Tạo liên kết" }).click()

  await expect(dialog.getByLabel("Liên kết chia sẻ")).toHaveValue(
    new RegExp(`/share/${TOKEN}$`)
  )
  expect(body).toEqual({ conversationId: ORIGINAL_ID })
  await page.screenshot({
    path: testInfo.outputPath(`share-dialog-${testInfo.project.name}.png`),
  })
})

test("the owner lists and revokes shared links", async ({ page }, testInfo) => {
  await authenticateAs(page)
  let shares = [
    {
      conversationId: ORIGINAL_ID,
      createdAt,
      id: SHARE_ID,
      messageCount: 2,
      title: TITLE,
      token: TOKEN,
    },
  ]
  await page.route(path("/shares"), (route) =>
    route.fulfill({
      json: ok({
        data: shares,
        limit: 10,
        page: 1,
        totalItems: shares.length,
        totalPages: shares.length ? 1 : 0,
      }),
    })
  )
  await page.route(path(`/shares/${SHARE_ID}`), (route) => {
    shares = []
    return route.fulfill({ json: ok(null) })
  })

  await page.goto("/shared-links")
  await expect(page.getByRole("link", { name: TITLE })).toBeVisible()
  const pageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth
  )
  expect(pageWidth).toBe(page.viewportSize()?.width)
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath(`shared-links-${testInfo.project.name}.png`),
  })

  await page.getByRole("button", { name: `Thu hồi liên kết ${TITLE}` }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Thu hồi", exact: true })
    .click()

  await expect(page.getByText("Bạn chưa chia sẻ liên kết nào")).toBeVisible()
  await expect(page.getByText("Đã thu hồi liên kết.")).toBeVisible()
})
