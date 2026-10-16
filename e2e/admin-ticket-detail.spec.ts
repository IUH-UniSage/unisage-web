import { expect, test, type Page } from "@playwright/test"

import { authenticateAs } from "./support/auth"

const TICKET_ID = "5b0f3a49-0a0e-4c4b-9a39-2f4f3b1f6c11"
const TRACE_ID = "8d1e2f3a-4b5c-4d6e-8f70-112233445566"

const ticket = {
  citations: [{ documentId: "doc-1", index: 1, title: "Quy chế đào tạo" }],
  contextChunks: [
    {
      chunkId: "chunk-1",
      cited: true,
      content:
        "Sinh viên được chuyển ngành khi đã hoàn thành năm học đầu tiên.",
      documentId: "doc-1",
      headingPath: ["CHƯƠNG II", "Điều 12. Chuyển ngành"],
      index: 1,
      pageEnd: 14,
      pageStart: 13,
      score: 0.78,
      section: "Điều 12. Chuyển ngành",
      sourceType: "PDF",
      title: "Quy chế đào tạo",
    },
    {
      chunkId: "chunk-2",
      cited: false,
      content: "Hồ sơ đính kèm gồm bảng ghi kết quả học tập gốc.",
      documentId: "doc-2",
      index: 2,
      pageStart: 1,
      score: 0.68,
      section: "ĐƠN XIN CHUYỂN NGÀNH",
      title: "Mẫu đơn xin chuyển ngành",
    },
  ],
  conversationId: "0c2f6d1e-7a55-4b8a-9d0e-5f2d4e3c2b1a",
  createdAt: "2026-10-07T11:26:00",
  description: "Bot nói không có hướng dẫn nhưng mẫu đơn có ghi rõ.",
  id: TICKET_ID,
  messageContent:
    "Hiện chưa có hướng dẫn chi tiết về giấy tờ cần đính kèm [1].",
  messageId: "7e1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b",
  questionContent: "Đơn xin chuyển ngành cần đính kèm giấy tờ gì?",
  resolution: null,
  status: "OPEN",
  title: "Trả lời sai về giấy tờ chuyển ngành",
  traceId: TRACE_ID,
  type: "AI_SYSTEM_ERROR",
  updatedAt: null,
  userEmail: "sv001@example.edu.vn",
  userId: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
  userName: "Nguyễn Minh Anh",
  webSources: [
    {
      cited: false,
      content: "Thông báo chuyển ngành học kỳ 1 năm học 2026-2027.",
      index: 3,
      kind: "CONTENT",
      score: 0.41,
      title: "Thông báo chuyển ngành",
      url: "https://iuh.edu.vn/thong-bao-chuyen-nganh",
    },
    {
      cited: true,
      index: null,
      kind: "LINK",
      score: 0.62,
      title: "Quy trình chuyển ngành",
      url: "https://pdt.iuh.edu.vn/quy-trinh-chuyen-nganh",
    },
  ],
}

async function mockTickets(page: Page) {
  await page.route("**/api/v1/master/tickets**", async (route) => {
    const { pathname } = new URL(route.request().url())
    const data = pathname.endsWith(`/tickets/${TICKET_ID}`)
      ? ticket
      : { data: [ticket], limit: 10, page: 0, totalItems: 1, totalPages: 1 }
    await route.fulfill({
      contentType: "application/json",
      json: { code: 1000, data, message: "Successful" },
      status: 200,
    })
  })
}

test("opens a ticket from the admin list on its own admin page", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium")

  await authenticateAs(page, "SUPER_ADMIN")
  await mockTickets(page)
  await page.goto("/admin/tickets")

  await page.getByRole("link", { name: `Xem yêu cầu ${ticket.title}` }).click()

  await expect(page).toHaveURL(new RegExp(`/admin/tickets/${TICKET_ID}$`))
  await expect(
    page.getByRole("heading", { level: 1, name: ticket.title })
  ).toBeVisible()
})

test("shows the chunks, web pages and trace id behind the answer", async ({
  page,
}) => {
  await authenticateAs(page, "SUPER_ADMIN")
  await mockTickets(page)
  await page.goto(`/admin/tickets/${TICKET_ID}`)

  // One of two chunks and one of two web pages is cited.
  await expect(page.getByText("1 / 2 được trích dẫn")).toHaveCount(2)
  await expect(page.getByText("Mẫu đơn xin chuyển ngành")).toBeVisible()
  await page.getByRole("button", { name: /Mẫu đơn xin chuyển ngành/ }).click()
  await expect(
    page.getByText("Hồ sơ đính kèm gồm bảng ghi kết quả học tập gốc.")
  ).toBeVisible()

  await expect(
    page.getByRole("link", { name: "Quy trình chuyển ngành" })
  ).toHaveAttribute("href", "https://pdt.iuh.edu.vn/quy-trinh-chuyen-nganh")
  await expect(page.getByText(TRACE_ID).first()).toBeVisible()
})
