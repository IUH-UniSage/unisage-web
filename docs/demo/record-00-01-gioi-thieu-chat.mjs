// Video 0 "Giới thiệu" và Video 1 "Hỏi đáp" (docs/demo/kich-ban-demo-tong-the.md).
//
// Video 1 cần hồ sơ học vụ của TST-CNPM-L1 đang trống (để hệ thống hỏi lại): xóa dòng
// user_profiles của tài khoản này trong DB của agent trước mỗi lần quay.
//
//   node docs/demo/record-00-01-gioi-thieu-chat.mjs [thư-mục-xuất] [logo]
//   ONLY=00 hoặc ONLY=01 để quay một video.

import path from "node:path"

import { BASE, clearDemoConversations, log, recordVideo } from "./lib/demo-kit.mjs"
import { Q } from "./lib/questions.mjs"

const outDir = path.resolve(process.argv[2] ?? "output/demo")
const logoFile = process.argv[3] ?? new URL("./lib/unisage-card-logo.png", import.meta.url).pathname
const only = process.env.ONLY

const THESIS_K18 = "kế hoạch thực hiện khóa luận tốt nghiệp ngành công nghệ thực phẩm K18"
const ENGLISH_K18 =
  "sinh viên ngành công nghệ kỹ thuật cơ khí khóa 18 muốn đăng ký tiếng anh 2 thì phải học " +
  "trước môn nào, môn này bao nhiêu tín chỉ"
// TST-CNPM-L0 (25/11/2026): with TST-CNPM-L1, gpt-5-mini read the K2024 row of the fee table
// for the K2025 question every time (930.000 instead of 980.000).
const L1 = "TST-CNPM-L0 · BM Công nghệ Phần mềm · cấp 0"

await clearDemoConversations("cnpmL1", [
  Q.fee, Q.englishK22, Q.creditsMine, Q.internshipMine,
  "chương trình đào tạo ngành công nghệ kỹ thuật cơ khí khóa 22: học phần tiếng anh 2 phải học trước môn nào, bao nhiêu tín chỉ",
  "chương trình đào tạo ngành công nghệ kỹ thuật cơ khí khóa 22: học phần tiếng anh 1 có mã học phần là gì, bao nhiêu tín chỉ",
  "học phí 1 tín chỉ lý thuyết của mình là bao nhiêu",
  "học phí 1 tín chỉ thực hành của mình là bao nhiêu",
])
await clearDemoConversations("cnpmL0", [
  Q.fee, Q.englishK22, Q.creditsMine, Q.internshipMine,
  // titles left by earlier runs
  THESIS_K18, ENGLISH_K18,
  "học phí đại học chính quy khóa 2025 khối công nghệ 1 tín chỉ lý thuyết bao nhiêu",
  "liệt kê chi tiết mức thu học phí của tất cả các hệ đào tạo năm học 2025-2026",
  "tóm tắt giúp mình toàn bộ quy chế đào tạo trình độ đại học",
])

// Video 0's access-control overview: what a role grants, what department + level grant, and
// which documents a user's answers may draw on. It states the rule without the
// parent/child-department question (still open in the script) either way.
const box = (text, sub = "") =>
  `<div style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.45);
    border-radius:12px;padding:12px 18px;font-size:21px;font-weight:600">${text}` +
  (sub ? `<div style="font-size:16px;font-weight:400;opacity:.85;margin-top:4px">${sub}</div>` : "") +
  "</div>"
const arrow = '<div style="font-size:28px;opacity:.9">➜</div>'
const rule = (left, right) =>
  `<tr><td style="padding:8px 18px;border:1px solid rgba(255,255,255,.35);font-weight:600">${left}</td>` +
  `<td style="padding:8px 18px;border:1px solid rgba(255,255,255,.35)">${right}</td></tr>`
const ACCESS_DIAGRAM = `
  <div style="display:grid;grid-template-columns:auto auto auto auto auto;gap:14px 18px;
              align-items:center;text-align:left;margin:4px auto 26px;width:max-content">
    <div style="grid-row:span 2">${box("Người dùng")}</div>
    ${arrow}${box("Vai trò")}${arrow}
    ${box("Chức năng được sử dụng", "hỏi đáp, quản trị người dùng, nạp tài liệu…")}
    ${arrow}${box("Phòng ban + cấp truy cập", "cấp 0–5")}${arrow}
    ${box("Tài liệu được dùng để trả lời")}
  </div>
  <table style="border-collapse:collapse;margin:0 auto 22px;font-size:19px;text-align:left">
    ${rule("Tài liệu công khai", "Mọi người dùng, kể cả khách")}
    ${rule("Tài liệu nội bộ<div style='font-size:15px;font-weight:400;opacity:.85'>" +
      "gắn phòng ban và cấp tối thiểu</div>",
      "Người dùng đúng phòng ban <b>và</b> có cấp truy cập ≥ cấp tối thiểu của tài liệu")}
  </table>
  <div style="font-size:18px;opacity:.9">Quản trị viên gán quyền cho người dùng; ` +
  `người nạp tài liệu gán phạm vi cho tài liệu.</div>`

// ------------------------------------------------------------------ Video 0: Giới thiệu
if (!only || only === "00") await recordVideo(
  { name: "video-00-gioi-thieu", outDir, logoFile, totalSteps: 1 },
  async (d) => {
    await d.scene("mở đầu", async () => {
      await d.page.goto(`${BASE}/`)
      await d.page.waitForLoadState("networkidle").catch(() => {})
      await d.card("UniSage – Trợ lý học vụ", [
        "Hệ thống hỏi đáp học vụ dựa trên văn bản của Trường Đại học Công nghiệp TP.HCM.",
      ], 5000)
    })
    await d.scene("hỏi thử", async () => {
      await d.ask(Q.scholarshipGuest, { input: d.page.getByLabel("Hỏi UniSage") })
      await d.tipAnswer(
        "Hệ thống tìm các văn bản liên quan của Trường và tạo câu trả lời từ nội dung các " +
          "văn bản đó, kèm <b>nguồn</b> để đối chiếu.")
    })
    await d.scene("hai nguyên tắc", async () => {
      await d.card("Nguyên tắc trả lời", [
        "Câu trả lời chỉ dựa trên văn bản đã được nạp vào hệ thống.",
        "Mỗi câu trả lời kèm nguồn trích dẫn.",
      ], 6500)
    })
    await d.scene("hệ thống phân quyền", async () => {
      await d.card("Hệ thống phân quyền", [ACCESS_DIAGRAM], 14_000, { showLogo: false })
    })
    await d.scene("kết", async () => {
      await d.card("Nội dung các video tiếp theo", [
        "Người dùng: Hỏi đáp · Phân quyền tài liệu · Yêu cầu hỗ trợ",
        "Quản trị: Người dùng và vai trò · Phòng ban · Nạp tài liệu · Gói hạn mức",
      ], 7000, { keep: true })
    })
  }
)

// ------------------------------------------------------------------ Video 1: Hỏi đáp
if (!only || only === "01") await recordVideo(
  { name: "video-01-hoi-dap", outDir, logoFile, totalSteps: 7, accounts: ["cnpmL0"] },
  async (d) => {
    await d.scene("mở đầu", async () => {
      await d.page.goto(`${BASE}/`)
      await d.page.waitForLoadState("networkidle").catch(() => {})
      await d.card("Hỏi đáp", [
        "Hiểu câu hỏi viết tự nhiên, dẫn nguồn để đối chiếu, giữ ngữ cảnh khi hỏi nối tiếp,",
        "hỏi lại khi thiếu thông tin, nói rõ khi không có dữ liệu đúng phạm vi được hỏi.",
      ], 6000)
      await d.login("cnpmL0")
      await d.newChat()
    })

    await d.scene("1: viết tắt, không dấu", async () => {
      await d.label("Tình huống 1 · Câu hỏi viết tắt, không dấu", L1)
      await d.ask(Q.fee)
      await expectInAnswer(d, /980\.000/)
      await d.tipAnswer(
        "Câu hỏi viết tắt, không dấu vẫn được hiểu đúng: học phí, đại học chính quy, " +
          "khóa 2025, khối công nghệ, tín chỉ lý thuyết.")
      // Opening the source shows the cited page of the original document.
      await d.press(d.tour("chat-reply-citations").last().locator("button").first(),
        "Bấm vào <b>nguồn</b> để mở văn bản gốc")
      const drawer = d.page.getByLabel("Tài liệu tham chiếu")
      await drawer.waitFor({ timeout: 15_000 })
      await d.page.waitForTimeout(3000)
      await d.tip(drawer,
        "Mỗi câu trả lời kèm <b>nguồn</b>. Mở nguồn để xem văn bản gốc đúng trang đã trích " +
          "dẫn và đối chiếu con số trong câu trả lời.", { side: "beside", ms: 7500 })
      // Escape does not close the side panel; its close button does.
      await d.press(d.page.getByRole("button", { name: "Đóng tài liệu xem trước" }),
        "Đóng văn bản gốc", { ms: 1400 })
    })

    await d.scene("2: hỏi nối tiếp", async () => {
      await d.label("Tình huống 2 · Hỏi nối tiếp", L1)
      await d.ask(Q.feeFollowUp)
      await expectInAnswer(d, /930\.000/)
      await d.tipAnswer(
        "Câu hỏi nối tiếp chỉ nêu tiêu chí thay đổi (khóa 2024). Hệ thống giữ các tiêu chí " +
          "còn lại từ câu hỏi trước.")
    })

    await d.scene("3: hỏi lại", async () => {
      const panel = d.page.getByRole("region", { name: "Câu hỏi bổ sung" })
      await d.newChat()
      await d.label("Tình huống 3 · Câu hỏi phụ thuộc thông tin của người hỏi", L1)
      await d.ask(Q.creditsMine)
      await panel.waitFor({ timeout: 30_000 })
      await d.page.waitForTimeout(1200)
      await d.tip(panel,
        "Số tín chỉ phải tích lũy khác nhau theo ngành và chương trình đào tạo. Hồ sơ chưa có " +
          "các thông tin này nên hệ thống hỏi lại thay vì đoán.", { ms: 7500 })
      await answerPanel(d, /^\s*Đại học chính quy\s*$|kế toán|công nghệ thông tin|phần mềm/i)
      await d.waitForAnswer()
      await d.tipAnswer(
        "Câu trả lời áp dụng đúng lựa chọn của người dùng. Các thông tin này được lưu vào hồ " +
          "sơ cho các lần hỏi sau.")
    })

    await d.scene("4: không hỏi lại", async () => {
      await d.newChat()
      await d.label("Tình huống 4 · Thông tin đã có trong hồ sơ", L1)
      await d.ask(Q.internshipMine)
      await d.tipAnswer("Thông tin đã có trong hồ sơ nên hệ thống dùng lại, không hỏi lại.")
    })

    await d.scene("5: không đúng phạm vi", async () => {
      await d.newChat()
      await d.label("Tình huống 5 · Không có dữ liệu cho đúng khóa được hỏi", L1)
      await d.ask(Q.englishK22)
      // The K21 standard programme's code for it.
      await expectInAnswer(d, /4203014165/)
      await d.tipAnswer(
        "Không có văn bản cho đúng khóa được hỏi (khóa 22), hệ thống nêu rõ điều này trước, " +
          "rồi mới trình bày thông tin của các khóa đang có, ghi rõ từng khóa.", { ms: 8000 })
    })

    await d.scene("kết", async () => {
      await d.label(null)
      await d.card("Tóm tắt", [
        "Hiểu câu hỏi viết tự nhiên, kể cả viết tắt hoặc không dấu.",
        "Mỗi câu trả lời kèm nguồn; mở được văn bản gốc đúng trang để đối chiếu.",
        "Giữ ngữ cảnh khi hỏi nối tiếp.",
        "Thiếu thông tin thì hỏi lại, không đoán; thông tin đã chọn được ghi nhớ.",
        "Nói rõ khi dữ liệu không đúng phạm vi được hỏi.",
      ], 8000, { keep: true })
    })
  }
)

/**
 * Answers every tab of the open clarification panel - the LLM decides which fields it asks
 * (programme, major, cohort...), so each tab gets the option matching `prefer`, else its
 * first listed option - then sends.
 */
async function answerPanel(d, prefer) {
  const panel = d.page.getByRole("region", { name: "Câu hỏi bổ sung" })
  const tabs = Math.max(await panel.getByRole("tab").count(), 1)
  for (let tab = 0; tab < tabs; tab += 1) {
    const radios = panel.locator('[role="radio"]:visible')
    const names = await radios.evaluateAll((els) =>
      els.map((el) => el.getAttribute("aria-label") || el.closest("label")?.innerText ||
        el.parentElement?.innerText || ""))
    let index = names.findIndex((name) => prefer.test(name))
    if (index < 0) index = names.findIndex((name) => !/^\s*Khác/.test(name))
    log(`panel tab ${tab + 1}/${tabs}: ${names.join(" | ").slice(0, 200)} -> ${names[index]}`)
    await d.press(radios.nth(index), tabs > 1 ? "" : "Chọn phương án phù hợp", { ms: 1200 })
  }
  await d.press(d.page.getByRole("button", { name: "Gửi câu trả lời" }),
    "Bấm <b>Gửi câu trả lời</b>: hệ thống trả lời theo lựa chọn")
}

/** Fails the scene when the newest answer lacks `pattern` (gpt-5-mini once read the K2024
 * row of the fee table for a K2025 question, 25/11/2026). */
async function expectInAnswer(d, pattern) {
  const text = await d.answer().innerText().catch(() => "")
  if (!pattern.test(text)) throw new Error(`expected ${pattern} in: ${text.slice(0, 160)}`)
}
