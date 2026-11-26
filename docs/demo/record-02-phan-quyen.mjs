// Video 2 "Phân quyền tài liệu" (docs/demo/kich-ban-demo-tong-the.md).
//
//   node docs/demo/record-02-phan-quyen.mjs [thư-mục-xuất] [logo]

import path from "node:path"

import { BASE, clearDemoConversations, recordVideo } from "./lib/demo-kit.mjs"
import { Q } from "./lib/questions.mjs"

const outDir = path.resolve(process.argv[2] ?? "output/demo")
const logoFile = process.argv[3] ?? new URL("./lib/unisage-card-logo.png", import.meta.url).pathname

const Q_SEMINAR = Q.seminar
// Only in A2 (cấp 2): the weights question is also answered by a public QTDL plan.
const Q_THESIS = Q.thesisGap
const Q_KT = Q.observation

const WHO = {
  guest: "Khách · chưa đăng nhập",
  cnpmL0: "TST-CNPM-L0 · BM Công nghệ Phần mềm · cấp 0",
  cnpmL2: "TST-CNPM-L2 · BM Công nghệ Phần mềm · cấp 2",
  ktL5: "TST-KT-L5 · BM Kế toán · cấp 5",
}

await clearDemoConversations("cnpmL0", [Q_SEMINAR, Q_THESIS])
await clearDemoConversations("cnpmL2", [Q_THESIS])
await clearDemoConversations("ktL5", [Q_SEMINAR, Q_KT])

// ------------------------------------------------------------------ Video 2: Phân quyền
const yes = '<span style="color:#7ee2a8;font-weight:700">✓</span>'
const no = '<span style="color:#ff9b9b;font-weight:700">✗</span>'
const cell = 'style="padding:6px 16px;border:1px solid rgba(255,255,255,.35)"'
const matrix = `<table style="border-collapse:collapse;margin:6px auto;font-size:19px">
  <tr><th ${cell}></th><th ${cell}>Khách</th><th ${cell}>CNPM cấp 0</th>
      <th ${cell}>CNPM cấp 2</th><th ${cell}>Kế toán cấp 5</th></tr>
  <tr><td ${cell}>Seminar CNPM (cấp 0)</td><td ${cell}>${no}</td><td ${cell}>${yes}</td>
      <td ${cell}>${yes}</td><td ${cell}>${no}</td></tr>
  <tr><td ${cell}>Chấm khóa luận CNPM (cấp 2)</td><td ${cell}>${no}</td><td ${cell}>${no}</td>
      <td ${cell}>${yes}</td><td ${cell}>${no}</td></tr>
  <tr><td ${cell}>Dự giờ Kế toán (cấp 0)</td><td ${cell}>${no}</td><td ${cell}>${no}</td>
      <td ${cell}>${no}</td><td ${cell}>${yes}</td></tr></table>`

await recordVideo(
  {
    name: "video-02-phan-quyen", outDir, logoFile, totalSteps: 6,
    accounts: ["cnpmL0", "cnpmL2", "ktL5"],
  },
  async (d) => {
    const { page } = d
    await d.scene("mở đầu", async () => {
      await page.goto(`${BASE}/`)
      await page.waitForLoadState("networkidle").catch(() => {})
      await d.card("Phân quyền tài liệu", [
        "Tài liệu <b>công khai</b>: mọi người dùng, kể cả khách.",
        "Tài liệu <b>nội bộ</b>: đúng phòng ban <b>và</b> cấp truy cập ≥ cấp tối thiểu của " +
          "tài liệu (0–5).",
        "Cùng một câu hỏi, mỗi tài khoản nhận kết quả theo phạm vi quyền của mình.",
      ], 9000)
    })

    await d.scene("1: khách, tài liệu nội bộ", async () => {
      await d.label("Tình huống 1 · Khách hỏi về tài liệu nội bộ", WHO.guest)
      await d.ask(Q_SEMINAR, { input: page.getByLabel("Hỏi UniSage") })
      await d.tipAnswer(
        "Lịch seminar là tài liệu nội bộ của BM Công nghệ Phần mềm. Khách không có quyền nên " +
          "hệ thống không dùng tài liệu này để trả lời.")
    })

    await d.scene("2: đúng bộ môn, đủ cấp", async () => {
      await d.label(null)
      await d.login("cnpmL0")
      await d.newChat()
      await d.label("Tình huống 2 · Đúng bộ môn, đủ cấp", WHO.cnpmL0)
      await d.ask(Q_SEMINAR)
      await d.tipAnswer(
        "Cùng bộ môn; cấp của tài khoản (0) ≥ cấp tối thiểu của tài liệu (0) nên tài liệu " +
          "được dùng để trả lời.")
    })

    await d.scene("3: đúng bộ môn, chưa đủ cấp", async () => {
      await d.newChat()
      await d.label("Tình huống 3 · Đúng bộ môn, chưa đủ cấp", WHO.cnpmL0)
      await d.ask(Q_THESIS)
      await d.tipAnswer(
        "Quy chế chấm khóa luận yêu cầu cấp 2. Tài khoản cấp 0 chưa đủ điều kiện dù cùng bộ " +
          "môn, nên nội dung quy chế không được dùng.")
    })

    await d.scene("4: đủ cấp", async () => {
      await d.label(null)
      await d.logout("cnpmL0")
      await d.login("cnpmL2")
      await d.newChat()
      await d.label("Tình huống 4 · Đủ cấp", WHO.cnpmL2)
      await d.ask(Q_THESIS)
      await d.tipAnswer("Cấp 2 xem được tài liệu cấp 0, 1 và 2 của bộ môn mình.")
    })

    await d.scene("5: cấp cao nhất, khác bộ môn", async () => {
      await d.label(null)
      await d.logout("cnpmL2")
      await d.login("ktL5")
      await d.newChat()
      await d.label("Tình huống 5 · Cấp cao nhất, khác bộ môn", WHO.ktL5)
      await d.ask(Q_SEMINAR)
      await d.tipAnswer(
        "Cấp 5 là cấp cao nhất nhưng thuộc BM Kế toán. Khác phòng ban thì không xem được " +
          "tài liệu nội bộ của BM Công nghệ Phần mềm.")
    })

    await d.scene("6: tài liệu của chính đơn vị", async () => {
      await d.newChat()
      await d.label("Tình huống 6 · Tài liệu của chính đơn vị", WHO.ktL5)
      await d.ask(Q_KT)
      await d.tipAnswer("Tài liệu nội bộ của chính BM Kế toán thì tài khoản này xem được.")
    })

    await d.scene("kết", async () => {
      await d.label(null)
      await d.card("Kết quả theo tài khoản", [matrix], 9000)
      await d.card("Tóm tắt", [
        "Tài liệu nội bộ: đúng phòng ban <b>và</b> đủ cấp truy cập.",
        "Không có quyền thì nội dung tài liệu không được dùng và không bị lộ.",
      ], 6500, { keep: true })
    })
  }
)
