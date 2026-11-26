// Video 3 "Yêu cầu hỗ trợ (gửi và xử lý)"
// (docs/demo/kich-ban-demo-tong-the.md).
//
//   node docs/demo/record-03-ho-tro.mjs [thư-mục-xuất] [logo]

import path from "node:path"

import { BASE, clearDemoConversations, recordVideo } from "./lib/demo-kit.mjs"
import { Q } from "./lib/questions.mjs"

const outDir = path.resolve(process.argv[2] ?? "output/demo")
const logoFile = process.argv[3] ?? new URL("./lib/unisage-card-logo.png", import.meta.url).pathname

// Only in A2 (cấp 2): the weights question is also answered by a public QTDL plan.
const Q_THESIS = Q.thesisGap
const RESOLUTION =
  "Quy chế chấm khóa luận áp dụng cho giảng viên cấp 2 trở lên. Đề nghị liên hệ Trưởng Bộ " +
  "môn để được cấp quyền."

const WHO = {
  cnpmL0: "TST-CNPM-L0 · BM Công nghệ Phần mềm · cấp 0",
  admin: "SA-001 · quản trị viên",
}

await clearDemoConversations("cnpmL0", [Q_THESIS])

// ------------------------------------------------------------------ Video 3: Yêu cầu hỗ trợ
await recordVideo(
  {
    name: "video-03-yeu-cau-ho-tro", outDir, logoFile, totalSteps: 5,
    accounts: ["cnpmL0", "admin"],
  },
  async (d) => {
    const { page } = d

    await d.scene("mở đầu", async () => {
      await page.goto(`${BASE}/`)
      await page.waitForLoadState("networkidle").catch(() => {})
      await d.card("Yêu cầu hỗ trợ", [
        "Người dùng báo câu trả lời chưa đáp ứng → cán bộ xác định nguyên nhân và phản hồi → " +
          "người gửi nhận phản hồi.",
      ], 6000)
      await d.login("cnpmL0")
      await d.newChat()
    })

    await d.scene("1: gửi yêu cầu", async () => {
      await d.label("Phần 1 · Người dùng gửi yêu cầu", WHO.cnpmL0)
      await d.ask(Q_THESIS)
      await d.press(page.getByRole("button", { name: "Báo cáo câu trả lời này" }).last(),
        "Câu trả lời chưa đáp ứng: bấm nút <b>Báo cáo</b> ngay dưới câu trả lời")
      const dialog = page.getByRole("dialog")
      await dialog.waitFor({ timeout: 10_000 })
      await page.waitForTimeout(800)
      await d.choose(page.locator("#ticket-type"), "AI không trả lời được",
        "Chọn <b>loại yêu cầu</b>: AI không trả lời được")
      // d.type() falls back to fill() when typing Vietnamese key by key drops characters.
      await d.type(page.locator("#ticket-description"),
        "Cần trọng số điểm khóa luận để hướng dẫn sinh viên.",
        "Mô tả ngắn điều cần hỗ trợ", { delay: 40 })
      await d.tip(dialog,
        "Câu hỏi và câu trả lời được đính kèm tự động, nên cán bộ xử lý có đủ ngữ cảnh mà " +
          "người dùng không phải chép lại.", { side: "beside", ms: 7000 })
      await d.press(dialog.getByRole("button", { name: "Gửi yêu cầu" }), "Bấm <b>Gửi yêu cầu</b>")
      await dialog.waitFor({ state: "hidden", timeout: 15_000 })
      await page.waitForTimeout(1500)
    })

    await d.scene("2: cán bộ mở yêu cầu", async () => {
      await d.label(null)
      await d.logout("cnpmL0")
      await d.login("admin")
      await d.label("Phần 2 · Cán bộ xử lý", WHO.admin)
      await d.go("Yêu cầu hỗ trợ", "/admin/tickets")
      const view = page.getByRole("link", { name: `Xem yêu cầu ${Q_THESIS}` }).first()
      await view.waitFor({ timeout: 20_000 })
      await page.waitForTimeout(1000)
      await d.press(view, "Yêu cầu mới nhất ở đầu danh sách: bấm để xem chi tiết")
      const content = d.tour("ticket-detail-content")
      await content.waitFor({ timeout: 20_000 })
      await page.waitForTimeout(1500)
      await d.tip(content, "Yêu cầu có sẵn câu hỏi, câu trả lời và mô tả của người dùng.",
        { side: "beside" })
      // The innermost card titled "Chunks đã dùng" (outer cards also contain that title).
      const used = page.locator('[data-slot="card"]').filter({
        has: page.locator('[data-slot="card-title"]', { hasText: /^Chunks đã dùng$/ }),
      }).last()
      await d.tip(used,
        "Các đoạn tài liệu hệ thống đã dùng không có quy chế chấm khóa luận: tài liệu này " +
          "nằm ngoài phạm vi quyền của tài khoản. Nguyên nhân là cấp truy cập, không phải " +
          "lỗi trả lời.", { side: "beside", ms: 8500 })
    })

    await d.scene("3: phản hồi", async () => {
      await d.choose(page.locator("#ticket-status"), "Đã giải quyết",
        "Đổi <b>trạng thái</b> sang Đã giải quyết")
      const resolution = page.locator("#ticket-resolution")
      await d.type(resolution, RESOLUTION, "Viết <b>phản hồi</b> gửi người dùng", { delay: 25 })
      await d.tip(resolution,
        "Chuyển sang <b>Đã giải quyết</b> bắt buộc kèm phản hồi cho người gửi.")
      await d.press(page.getByRole("button", { name: "Lưu thay đổi" }), "Bấm <b>Lưu thay đổi</b>")
      // Saving returns to the ticket list; the newest row is the one just resolved.
      await page.waitForURL(/\/admin\/tickets\/?$/, { timeout: 10_000 }).catch(() => {})
      const row = page.getByRole("row", { name: new RegExp(Q_THESIS.slice(0, 30)) }).first()
      await row.waitFor({ timeout: 10_000 })
      await page.waitForTimeout(2500)
      const text = await row.innerText()
      if (!text.includes("Đã giải quyết")) throw new Error(`ticket row after save: ${text}`)
    })

    await d.scene("4: người gửi nhận phản hồi", async () => {
      await d.label(null)
      await d.logout("admin")
      await d.login("cnpmL0")
      await d.label("Phần 3 · Người gửi nhận phản hồi", WHO.cnpmL0)
      await d.go("Yêu cầu hỗ trợ", "/tickets", "Mở <b>Yêu cầu hỗ trợ</b> của tôi")
      const ticket = d.tour("my-ticket-list")
        .getByRole("link", { name: new RegExp(Q_THESIS.slice(0, 30)) }).first()
      await ticket.waitFor({ timeout: 20_000 })
      await page.waitForTimeout(1000)
      await d.press(ticket, "Yêu cầu đã gửi: bấm để xem phản hồi")
      const resolution = d.tour("ticket-detail-resolution")
      await resolution.waitFor({ timeout: 20_000 })
      await page.waitForTimeout(1200)
      await d.tip(resolution,
        "Người gửi xem được trạng thái <b>Đã giải quyết</b> và phản hồi của cán bộ ngay trong " +
          "yêu cầu của mình.", { ms: 7000 })
    })

    await d.scene("kết", async () => {
      await d.label(null)
      await d.card("Tóm tắt", [
        "Gửi yêu cầu từ ngay câu trả lời; ngữ cảnh được đính kèm tự động.",
        "Cán bộ xác định nguyên nhân từ các đoạn tài liệu đã dùng.",
        "Phản hồi tới đúng người gửi.",
      ], 7000, { keep: true })
    })
  }
)
