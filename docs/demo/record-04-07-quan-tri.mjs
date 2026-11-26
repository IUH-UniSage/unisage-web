// Video 4 "Người dùng và vai trò", 5 "Phòng ban", 6 "Nạp tài liệu", 7 "Gói hạn mức"
// (docs/demo/kich-ban-demo-tong-the.md).
//
//   xvfb-run -a -s "-screen 0 1440x900x24" node docs/demo/record-04-07-quan-tri.mjs output/demo
//   ONLY=04 | 05 | 06 | 07 để quay một video.
//
// Users, roles and units can only be deactivated, never deleted, so the demo objects get a
// per-run suffix (DEMO-GV-1142, BM_KHOA_HOC_DU_LIEU_1142, ...). Video 4 creates the demo
// account; video 7 creates its own (off camera) so earlier questions do not use up its plan.

import fs from "node:fs"
import path from "node:path"

import { ACCOUNTS, BASE, api, log, recordVideo, secret } from "./lib/demo-kit.mjs"
import { Q } from "./lib/questions.mjs"

const outDir = path.resolve(process.argv[2] ?? "output/demo")
const logoFile = process.argv[3] ?? new URL("./lib/unisage-card-logo.png", import.meta.url).pathname
const only = process.env.ONLY
const stateFile = path.join(outDir, ".demo-state.json")
const DEMO_DOC = path.resolve(
  "docs/demo/tai-lieu-demo/D1_quy-dinh-phong-thuc-hanh-may-chu-gpu-bm-cnpm-2026-2027.pdf"
)
const DEMO_DOC_TITLE =
  "Quy định sử dụng phòng thực hành và máy chủ GPU Bộ môn CNPM năm học 2026–2027"
const CNPM = "BM_CONG_NGHE_PHAN_MEM"
// The UI shows a department's readable name (its description) since 25/11/2026, the code
// as a second line: match either.
const CNPM_LABEL = /BM_CONG_NGHE_PHAN_MEM|Bộ môn Công Nghệ Phần Mềm/i
const ADMIN = "SA-001 · quản trị viên"
const L3 = "TST-CNPM-L3 · BM Công nghệ Phần mềm · cấp 3"

const loadState = () => (fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile)) : {})
const saveState = (patch) => {
  const state = { ...loadState(), ...patch }
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
  return state
}

/** The submit button of a full-page form (header and footer both render one). */
const submit = (d, label) => d.page.getByRole("button", { name: label, exact: true }).first()

/** Opens the admin user list (through the sidebar), searches `code` and returns that row. */
async function userRow(d, code) {
  await d.go("Quản lý người dùng", "/admin/users")
  const search = d.page.getByLabel("Tìm người dùng")
  await search.waitFor({ timeout: 20_000 })
  await d.type(search, code, `Tìm tài khoản <b>${code}</b>`)
  await search.press("Enter")
  const row = d.page.getByRole("row", { name: new RegExp(code) }).first()
  await row.waitFor({ timeout: 20_000 })
  await d.page.waitForTimeout(1200)
  return row
}

async function editUser(d, code) {
  const row = await userRow(d, code)
  await d.press(row.getByRole("button", { name: /^Hành động cho/ }),
    "Mở menu thao tác của tài khoản")
  await d.press(d.page.getByRole("menuitem", { name: "Chỉnh sửa" }), "Chọn <b>Chỉnh sửa</b>",
    { ms: 1500 })
  await d.page.locator("#user-role").waitFor({ timeout: 20_000 })
  await d.page.waitForTimeout(1500)
}

/** Fails the scene unless the newest answer says the information is not available. */
async function expectNoInfo(d) {
  const text = await d.answer().innerText().catch(() => "")
  if (!/chưa có|không có thông tin|không tìm thấy/i.test(text.slice(0, 400))) {
    throw new Error(`expected a "no information" answer, got: ${text.slice(0, 160)}`)
  }
  // A "no information" answer cites nothing: one that cites a document claims something from
  // it (25/11/2026: "theo Hướng dẫn phân công GVHD ... văn bản quy định cách xử lý ..." - A1
  // says nothing about score gaps).
  if ((await d.answer().locator('[data-tour="chat-reply-citations"]').count()) > 0) {
    throw new Error(`a "no information" answer must cite nothing, got: ${text.slice(0, 160)}`)
  }
}

const deptRow = (d, name) =>
  d.page.locator('[data-tour="user-form-departments"] .divide-y > div').filter({ hasText: name })

// ------------------------------------------------------------------ Video 4: Người dùng
if (!only || only === "04") {
  const suffix = new Date().toTimeString().slice(0, 5).replace(":", "")
  const state = saveState({
    suffix,
    userCode: `DEMO-GV-${suffix}`,
    password: secret("DEMO_NEW_USER_PASSWORD"),
    email: `demo.gv${suffix}@unisage.test`,
    // Unique: the backend rejects an empty phone as "already used" when another account
    // has none either ("Số điện thoại này đã được sử dụng!").
    phone: `0987${suffix}${String(Date.now()).slice(-2)}`,
  })
  ACCOUNTS.demoGv = [state.userCode, state.password]
  const WHO = `${state.userCode} · BM Công nghệ Phần mềm`

  await recordVideo(
    { name: "video-04-nguoi-dung-vai-tro", outDir, logoFile, totalSteps: 5, accounts: ["admin"] },
    async (d) => {
      const { page } = d
      await d.scene("mở đầu", async () => {
        await page.goto(`${BASE}/`)
        await page.waitForLoadState("networkidle").catch(() => {})
        await d.card("Người dùng và vai trò", [
          "Tài khoản mới có ngay phạm vi tài liệu theo phòng ban và cấp truy cập được gán;",
          "đổi cấp truy cập thì kết quả trả lời thay đổi theo.",
        ], 6000)
        await d.login("admin")
      })

      await d.scene("1: tạo tài khoản", async () => {
        await d.label("Tình huống 1 · Tạo tài khoản giảng viên mới", ADMIN)
        await d.go("Quản lý người dùng", "/admin/users")
        await d.press(page.getByRole("button", { name: "Thêm người dùng" }).first(),
          "Bấm <b>Thêm người dùng</b> để mở biểu mẫu tạo tài khoản")
        await page.locator("#user-lastname").waitFor({ timeout: 20_000 })
        await page.waitForTimeout(1000)
        await d.type(page.locator("#user-lastname"), "Trần", "Nhập <b>họ</b> và <b>tên</b>")
        await d.type(page.locator("#user-firstname"), "Minh An")
        await d.type(page.locator("#user-email"), state.email,
          "<b>Email</b> và <b>số điện thoại</b> liên hệ")
        await d.type(page.locator("#user-phone"), state.phone)
        await d.type(page.locator("#user-code"), state.userCode,
          "<b>Mã đăng nhập</b> (mã giảng viên) và <b>mật khẩu</b> ban đầu")
        await d.type(page.locator("#user-password"), state.password)
        await d.choose(page.locator("#user-role"), /^USER\b/,
          "Chọn <b>vai trò</b>: USER là người dùng thông thường (hỏi đáp, gửi yêu cầu hỗ trợ)")
        await d.press(page.getByRole("button", { name: "Thêm phòng ban" }),
          "Gán <b>phòng ban</b> cho tài khoản: bấm <b>Thêm phòng ban</b>")
        await d.type(page.getByPlaceholder("Tìm phòng ban theo tên..."), "CONG_NGHE_PHAN_MEM",
          "Tìm <b>Bộ môn Công nghệ Phần mềm</b>")
        await page.waitForTimeout(800)
        const cnpm = page.getByRole("checkbox", { name: CNPM_LABEL }).first()
        await d.hint(cnpm, "Tích chọn bộ môn")
        await cnpm.check()
        await page.waitForTimeout(800)
        await d.press(page.getByRole("button", { name: "Cập nhật danh sách" }),
          "Bấm <b>Cập nhật danh sách</b> để thêm bộ môn vào tài khoản")
        await d.choose(deptRow(d, CNPM_LABEL).getByRole("combobox"), "Cấp 1",
          "Chọn <b>cấp truy cập</b> tại bộ môn: cấp 1")
        await d.tip(d.tour("user-form-departments"),
          "<b>Vai trò</b> quyết định chức năng được sử dụng. <b>Phòng ban</b> và <b>cấp truy " +
            "cập</b> quyết định tài liệu nội bộ nào được dùng để trả lời. Tài khoản này: BM " +
            "Công nghệ Phần mềm, cấp 1.", { ms: 8000 })
        await d.press(submit(d, "Tạo người dùng"), "Bấm <b>Tạo người dùng</b> để lưu")
        await page.waitForURL((url) => !url.pathname.endsWith("/new"), { timeout: 20_000 })
        await page.waitForTimeout(1500)
      })

      await d.scene("2: phạm vi của tài khoản mới", async () => {
        await d.label(null)
        await d.logout("admin")
        await d.tourSeen("demoGv")
        await d.login("demoGv")
        await d.newChat()
        await d.label("Tình huống 2 · Phạm vi của tài khoản mới", `${WHO} · cấp 1`)
        await d.ask(Q.advisorDeadline)
        await d.tipAnswer(
          "Hướng dẫn phân công GVHD là tài liệu cấp 1 của bộ môn: tài khoản cấp 1 đọc được.")
        await d.newChat()
        await d.ask(Q.thesisGap)
        await expectNoInfo(d)
        await d.tipAnswer(
          "Quy chế chấm khóa luận yêu cầu cấp 2: tài khoản mới chưa đọc được. Phạm vi tài liệu " +
            "có hiệu lực ngay khi tài khoản được tạo.", { ms: 7500 })
      })

      await d.scene("3: nâng cấp truy cập", async () => {
        await d.label(null)
        await d.logout("demoGv")
        await d.login("admin")
        await editUser(d, state.userCode)
        await d.label("Tình huống 3 · Nâng cấp truy cập lên cấp 2", ADMIN)
        await d.choose(deptRow(d, CNPM_LABEL).getByRole("combobox"), "Cấp 2",
          "Đổi cấp truy cập tại BM Công nghệ Phần mềm từ cấp 1 lên <b>cấp 2</b>")
        await d.press(submit(d, "Lưu thay đổi"), "Bấm <b>Lưu thay đổi</b>")
        const access = d.tour("user-detail-departments")
        await access.waitFor({ timeout: 20_000 })
        await page.waitForTimeout(1200)
        await d.tip(access, "Tài khoản được nâng lên cấp 2 tại BM Công nghệ Phần mềm.")
        await d.label(null)
        await d.logout("admin")
        await d.login("demoGv")
        await d.newChat()
        await d.label("Tình huống 3 · Hỏi lại sau khi nâng cấp", `${WHO} · cấp 2`)
        await d.ask(Q.thesisGap)
        const upgraded = await d.answer().innerText().catch(() => "")
        if (!/2,5/.test(upgraded)) throw new Error(`expected the 2,5-point rule, got: ${upgraded.slice(0, 160)}`)
        await d.tipAnswer(
          "Sau khi được nâng lên cấp 2, cùng câu hỏi đã nhận được câu trả lời. Thay đổi quyền " +
            "có hiệu lực từ lần đăng nhập tiếp theo.", { ms: 7500 })
      })

      await d.scene("kết", async () => {
        await d.label(null)
        await d.card("Tóm tắt", [
          "Vai trò quyết định chức năng được sử dụng.",
          "Phòng ban và cấp truy cập quyết định phạm vi tài liệu.",
          "Thay đổi quyền có hiệu lực từ lần đăng nhập tiếp theo.",
        ], 7000, { keep: true })
      })
    }
  )
}

// ------------------------------------------------------------------ Video 5: Phòng ban
if (!only || only === "05") {
  const suffix = new Date().toTimeString().slice(0, 5).replace(":", "")
  const unit = `BM_KHOA_HOC_DU_LIEU_${suffix}`
  saveState({ unit })

  await recordVideo(
    { name: "video-05-phong-ban", outDir, logoFile, totalSteps: 3, accounts: ["admin"] },
    async (d) => {
      const { page } = d
      await d.scene("mở đầu", async () => {
        await page.goto(`${BASE}/`)
        await page.waitForLoadState("networkidle").catch(() => {})
        await d.card("Phòng ban", [
          "Cơ cấu đơn vị nhiều cấp (Trường, khoa, bộ môn) là cơ sở để gán tài liệu và người dùng.",
        ], 6000)
        await d.login("admin")
      })

      await d.scene("1: cơ cấu tổ chức", async () => {
        await d.go("Phòng ban", "/admin/departments")
        const chart = d.tour("dept-org-chart")
        if (!(await chart.isVisible().catch(() => false))) {
          await page.goto(`${BASE}/admin/departments?mode=tree`)
        }
        await chart.waitFor({ timeout: 20_000 })
        await page.waitForTimeout(2500)
        await d.label("Tình huống 1 · Cơ cấu tổ chức", ADMIN)
        await d.tip(chart,
          "Cơ cấu đơn vị nhiều cấp: Trường, khoa, bộ môn. Mỗi tài liệu nội bộ và mỗi quyền " +
            "của người dùng đều gắn với một đơn vị trong cơ cấu này.", { side: "beside", ms: 7500 })
      })

      await d.scene("2: thêm đơn vị", async () => {
        await d.label("Tình huống 2 · Thêm bộ môn mới vào Khoa Công nghệ Thông tin", ADMIN)
        await d.press(page.getByRole("button", { name: "Chế độ xem danh sách" }),
          "Chuyển sang <b>dạng danh sách</b> để tìm đơn vị")
        const search = page.getByLabel("Tìm phòng ban")
        await search.waitFor({ timeout: 20_000 })
        await d.type(search, "KHOA_CNTT", "Tìm <b>Khoa Công nghệ Thông tin</b>")
        await search.press("Enter")
        await page.waitForTimeout(1500)
        await d.press(page
          .getByRole("button", { name: /^Hành động cho (KHOA_CNTT|Khoa Công Nghệ Thông Tin)/i })
          .first(), "Mở menu thao tác của khoa")
        await d.press(page.getByRole("menuitem", { name: "Thêm đơn vị trực thuộc" }),
          "Chọn <b>Thêm đơn vị trực thuộc</b>: đơn vị mới nằm dưới khoa này")
        await page.locator("#dept-name").waitFor({ timeout: 10_000 })
        await page.waitForTimeout(800)
        await d.type(page.locator("#dept-name"), unit, "Nhập <b>mã đơn vị</b>")
        await d.type(page.locator("#dept-desc"), "Bộ môn Khoa học Dữ liệu (đơn vị demo)",
          "Nhập <b>tên đầy đủ</b> hiển thị cho người dùng")
        await d.tip(d.tour("dept-form-parent"),
          "Đơn vị mới là <b>bộ môn</b> trực thuộc Khoa Công nghệ Thông tin.")
        await d.press(page.getByRole("button", { name: "Tạo đơn vị" }), "Bấm <b>Tạo đơn vị</b>")
        await page.waitForTimeout(1000)
        await d.type(search, unit, "Tìm lại đơn vị vừa tạo", { delay: 35 })
        await search.press("Enter")
        const row = page
          .getByRole("row", { name: new RegExp(`${unit}|Bộ môn Khoa học Dữ liệu \\(đơn vị demo\\)`) })
          .first()
        await row.waitFor({ timeout: 20_000 })
        await page.waitForTimeout(800)
        await d.tip(row,
          "Đơn vị mới dùng được ngay khi gán tài liệu và gán quyền cho người dùng.")
      })

      await d.scene("kết", async () => {
        await d.label(null)
        await d.card("Tóm tắt", [
          "Cơ cấu đơn vị nhiều cấp: Trường, khoa, bộ môn.",
          "Tài liệu và quyền của người dùng gắn với đơn vị trong cơ cấu.",
        ], 6500, { keep: true })
      })
    }
  )
}

// ------------------------------------------------------------------ Video 6: Nạp tài liệu
if (!only || only === "06") {
  // Re-runs start from "not ingested": remove D1 if an earlier run left it.
  const list = await api("admin", "GET", "/documents?page=1&limit=200").catch(() => null)
  const docs = list?.data ?? list?.content ?? list ?? []
  for (const doc of Array.isArray(docs) ? docs : []) {
    if (doc.title === DEMO_DOC_TITLE) {
      await api("admin", "DELETE", `/documents/${doc.id}`)
      log(`deleted the earlier demo document ${doc.id}`)
    }
  }

  await recordVideo(
    {
      name: "video-06-nap-tai-lieu", outDir, logoFile, totalSteps: 8,
      accounts: ["admin", "cnpmL2", "cnpmL3"],
    },
    async (d) => {
      const { page } = d
      await d.scene("mở đầu", async () => {
        await page.goto(`${BASE}/`)
        await page.waitForLoadState("networkidle").catch(() => {})
        await d.card("Nạp tài liệu", [
          "Trước khi nạp, hệ thống chưa trả lời được. Sau khi nạp (chia đoạn, embedding),",
          "câu hỏi được trả lời kèm nguồn, và chỉ đúng người có quyền mới nhận được.",
        ], 6500)
        await d.login("cnpmL3")
      })

      // Asked by a level-3 lecturer of BM CNPM, not SA-001: after an embed the retrieval cache
      // is invalidated per department, and SA-001's wildcard scope keeps serving the
      // pre-ingest "no information" result (seen 25/11).
      await d.scene("1: trước khi nạp", async () => {
        await d.newChat()
        await d.label("Tình huống 1 · Trước khi nạp tài liệu", L3)
        await d.ask(Q.gpu)
        await expectNoInfo(d)
        await d.tipAnswer("Văn bản chưa được nạp nên hệ thống không có dữ liệu để trả lời.")
      })

      await d.scene("2: tải lên và đặt quyền", async () => {
        await d.label(null)
        await d.logout("cnpmL3")
        await d.login("admin")
        await d.label("Tình huống 2 · Nạp tài liệu mới", ADMIN)
        await d.go("Quản trị tài liệu", "/admin/documents")
        await d.press(page.getByRole("button", { name: "Thêm tài liệu mới" }).first(),
          "Bấm <b>Thêm tài liệu mới</b>")
        await page.locator("#document-title").waitFor({ timeout: 20_000 })
        await page.waitForTimeout(1000)
        await d.hint(page.locator("#document-file").locator("xpath=.."),
          "Chọn <b>tệp PDF</b> của văn bản cần nạp")
        await page.setInputFiles("#document-file", DEMO_DOC)
        await page.waitForTimeout(1200)
        await d.type(page.locator("#document-title"), DEMO_DOC_TITLE,
          "Nhập <b>tiêu đề</b> văn bản (dùng khi trích dẫn nguồn)", { delay: 30 })
        await d.choose(page.locator("#document-department"), CNPM_LABEL,
          "Chọn <b>phòng ban</b> sở hữu tài liệu: BM Công nghệ Phần mềm")
        await d.choose(page.locator("#document-access-level"), "Cấp 3",
          "Chọn <b>cấp truy cập tối thiểu</b>: cấp 3")
        await d.tip(d.tour("document-form-classification"),
          "Tài liệu nội bộ của BM Công nghệ Phần mềm, cấp tối thiểu 3. Phòng ban và cấp được " +
            "gắn vào từng đoạn khi nạp, nên quy tắc phân quyền áp dụng ngay khi trả lời.",
          { ms: 8000 })
        await d.press(submit(d, "Tạo tài liệu"), "Bấm <b>Tạo tài liệu</b> để tải lên")
        const ingestNow = page.getByRole("button", { name: "Xử lý nạp liệu ngay" })
        await ingestNow.waitFor({ timeout: 30_000 })
        await d.press(ingestNow, "Bấm <b>Xử lý nạp liệu ngay</b> để chia đoạn và embedding")
        const next = page.getByRole("button", { name: "Tiếp tục" })
        await next.waitFor({ timeout: 60_000 })
        await page.waitForFunction(
          () => [...document.querySelectorAll("button")]
            .some((b) => b.textContent?.trim() === "Tiếp tục" && !b.disabled),
          null, { timeout: 120_000 }
        )
        await page.waitForTimeout(2000)
        await d.press(next, "Bước đọc tài liệu đã xong: bấm <b>Tiếp tục</b>")
      })

      await d.scene("3: chia đoạn", async () => {
        await d.label("Chia đoạn", ADMIN)
        await d.press(page.getByRole("button", { name: "Áp dụng" }),
          "Bấm <b>Áp dụng</b> để chia tài liệu thành các đoạn")
        const list = d.tour("ingest-chunk-list")
        const items = list.locator('[role="button"]')
        await d.fastForward(() => items.first().waitFor({ timeout: 180_000 }))
        await page.waitForTimeout(1500)
        await items.filter({ hasText: /36 giờ|Nhóm khóa luận/ }).first().click()
        await page.waitForTimeout(1200)
        await d.tip(d.tour("ingest-chunk-editor"),
          "Tài liệu được chia thành các đoạn để tìm kiếm. Bảng được giữ nguyên hàng và cột, " +
            "để số liệu không bị tách khỏi tiêu đề cột.", { side: "beside", ms: 7500 })
      })

      await d.scene("4: gộp đoạn quá ngắn", async () => {
        const list = d.tour("ingest-chunk-list")
        const items = list.locator('[role="button"]')
        const texts = await items.allInnerTexts()
        // The shortest chunk (not the first) is merged into the chunk just above it.
        let short = 1
        for (let i = 1; i < texts.length; i += 1) {
          if (texts[i].length < texts[short].length) short = i
        }
        log(`chunks: ${texts.length}, shortest #${short + 1}: ${texts[short].replace(/\s+/g, " ")}`)
        await d.label("Chỉnh sửa đoạn trước khi nạp: gộp một đoạn quá ngắn", ADMIN)
        await items.nth(short).click()
        await page.waitForTimeout(1000)
        await d.tip(items.nth(short),
          "Đoạn này quá ngắn, thiếu ngữ cảnh nên khó được tìm thấy đúng.")
        const shortBox = page.getByRole("textbox", { name: /^Nội dung đoạn/ })
        const shortText = (await shortBox.inputValue()).trim()
        await items.nth(short - 1).click()
        await page.waitForTimeout(1000)
        const editMode = page.getByRole("button", { name: "Chỉnh sửa", exact: true })
        if (await editMode.isVisible().catch(() => false)) await editMode.click()
        const box = page.getByRole("textbox", { name: /^Nội dung đoạn/ })
        await box.fill(`${(await box.inputValue()).trimEnd()}\n\n${shortText}`)
        await box.press("End")
        await d.hint(box, "Nội dung đoạn ngắn được dán vào cuối đoạn liền trên")
        await d.press(page.getByRole("button", { name: "Lưu thay đổi" }), "Bấm <b>Lưu thay đổi</b>")
        await d.press(items.nth(short).getByRole("button", { name: /^Xóa đoạn/ }),
          "Xóa đoạn ngắn, vì nội dung của nó đã nằm trong đoạn trên")
        await page.waitForTimeout(1200)
        await d.tip(d.tour("ingest-chunk-editor"),
          "Nội dung đoạn ngắn đã được gộp vào đoạn liền trên, đoạn thừa đã được xóa, trước khi " +
            "embedding.", { side: "beside", ms: 7000 })
      })

      await d.scene("5: embedding", async () => {
        await d.label("Embedding", ADMIN)
        await d.press(page.getByRole("button", { name: "Bắt đầu embedding" }),
          "Các đoạn đã ổn: bấm <b>Bắt đầu embedding</b>")
        const progress = d.tour("ingest-embedding")
        await progress.waitFor({ timeout: 30_000 })
        await page.waitForTimeout(1500)
        await d.tip(progress,
          "Mỗi đoạn được chuyển thành vector để tìm theo ngữ nghĩa, kèm tóm tắt và câu hỏi gợi " +
            "ý do hệ thống tạo.", { ms: 6000 })
        await d.fastForward(() =>
          page.getByText("Hoàn tất embedding").waitFor({ timeout: 900_000 }))
        await page.waitForTimeout(2500)
      })

      await d.scene("6: sau khi nạp", async () => {
        await d.label(null)
        await d.logout("admin")
        await d.login("cnpmL3")
        await d.newChat()
        await d.label("Tình huống 3 · Hỏi lại sau khi nạp", L3)
        await d.ask(Q.gpu)
        const after = await d.answer().innerText().catch(() => "")
        if (!/36 giờ/.test(after)) throw new Error(`expected 36 giờ GPU, got: ${after.slice(0, 160)}`)
        await d.tipAnswer(
          "Cùng câu hỏi, sau khi nạp hệ thống trả lời được và trích dẫn đúng văn bản vừa nạp.")
      })

      await d.scene("7: phân quyền áp dụng ngay", async () => {
        await d.label(null)
        await d.logout("cnpmL3")
        await d.login("cnpmL2")
        await d.newChat()
        await d.label("Tình huống 4 · Phân quyền áp dụng ngay",
          "TST-CNPM-L2 · BM Công nghệ Phần mềm · cấp 2")
        await d.ask(Q.gpu)
        await expectNoInfo(d)
        await d.tipAnswer(
          "Tài liệu yêu cầu cấp 3. Tài khoản cấp 2 của cùng bộ môn chưa đủ điều kiện nên nội " +
            "dung không được dùng.")
      })

      await d.scene("kết", async () => {
        await d.label(null)
        await d.card("Tóm tắt", [
          "Tải lên và đặt phạm vi truy cập cho tài liệu.",
          "Chia đoạn giữ nguyên bảng; chỉnh sửa đoạn trước khi nạp.",
          "Sau khi embedding, tài liệu được dùng ngay và đúng phạm vi quyền.",
        ], 7000, { keep: true })
      })
    }
  )
}

// ------------------------------------------------------------------ Video 7: Gói hạn mức
if (!only || only === "07") {
  // A fresh account (created off camera) so earlier questions do not count against the plan.
  const suffix = new Date().toTimeString().slice(0, 5).replace(":", "")
  const state = {
    suffix,
    userCode: `DEMO-HM-${suffix}`,
    password: secret("DEMO_NEW_USER_PASSWORD"),
  }
  const roles = await api("admin", "GET", "/rbac/roles?page=1&limit=100")
  const roleList = roles?.data ?? roles?.content ?? roles
  const userRole = roleList.find((r) => r.name === "USER")
  const levels = await api("admin", "GET", "/access-levels")
  const level2 = (levels?.data ?? levels).find((l) => l.level === 2)
  const tree = await api("admin", "GET", "/departments/roots")
  const findDept = (nodes) => {
    for (const node of nodes ?? []) {
      if (node.name === CNPM) return node
      const hit = findDept(node.children)
      if (hit) return hit
    }
    return null
  }
  await api("admin", "POST", "/users", {
    email: `demo.hm${suffix}@unisage.test`,
    code: state.userCode,
    password: state.password,
    firstName: "Hạn Mức",
    lastName: "Demo",
    phone: `0986${suffix}${String(Date.now()).slice(-2)}`,
    roleId: userRole.id,
    departmentAccesses: [{ departmentId: findDept(tree).id, accessLevelId: level2.id }],
  })
  log(`created user ${state.userCode}`)
  ACCOUNTS.demoGv = [state.userCode, state.password]
  const plan = `Demo hạn mức ${suffix}`
  const role = `GIANG_VIEN_DEMO_${suffix}`
  // Off camera: a role with the USER role's permissions, so only the plan differs.
  if (!roleList.some((r) => r.name === role)) {
    await api("admin", "POST", "/rbac/roles", {
      name: role,
      description: "Vai trò demo: quyền như USER, dùng để minh họa gói hạn mức",
      isActive: true,
      isSystemRole: false,
      permissionIds: userRole.permissions.map((p) => p.id),
      usageLimitPlanId: null,
    })
    log(`created role ${role}`)
  }
  saveState({ plan, role, quotaUser: state.userCode })
  const WHO = `${state.userCode} · vai trò ${role}`

  await recordVideo(
    {
      name: "video-07-goi-han-muc", outDir, logoFile, totalSteps: 6,
      accounts: ["admin"],
    },
    async (d) => {
      const { page } = d
      await d.scene("mở đầu", async () => {
        await page.goto(`${BASE}/`)
        await page.waitForLoadState("networkidle").catch(() => {})
        await d.card("Gói hạn mức", [
          "Mỗi vai trò có một gói hạn mức token theo 24 giờ và 7 ngày.",
          "Dùng hết hạn mức thì yêu cầu mới bị tạm chặn, kèm thời điểm được dùng lại.",
        ], 6500)
        await d.login("admin")
      })

      await d.scene("1: tạo gói", async () => {
        await d.label("Tình huống 1 · Tạo gói hạn mức và gán cho vai trò", ADMIN)
        await d.go("Cấu hình hạn mức", "/admin/usage-limits")
        const add = page.getByRole("button", { name: "Thêm gói mới" })
        await add.waitFor({ timeout: 20_000 })
        await d.press(add, "Bấm <b>Thêm gói mới</b>")
        await page.locator("#usage-plan-name").waitFor({ timeout: 10_000 })
        await page.waitForTimeout(800)
        await d.type(page.locator("#usage-plan-name"), plan, "Đặt <b>tên gói</b>")
        await d.type(page.locator("#usage-plan-daily"),
          String(process.env.DEMO_DAILY_TOKENS ?? 350),
          "Nhập <b>số token tối đa trong 24 giờ</b>; ô 7 ngày để trống là không giới hạn")
        await d.tip(d.tour("usage-plan-form-limits"),
          "Mỗi gói quy định số token được dùng trong <b>24 giờ</b> và <b>7 ngày</b>; để trống " +
            "là không giới hạn. Gói demo đặt hạn mức rất nhỏ để thấy ngay kết quả.", { ms: 7500 })
        await d.press(page.getByRole("button", { name: "Tạo gói" }), "Bấm <b>Tạo gói</b> để lưu")
        await page.waitForTimeout(1200)
      })

      await d.scene("2: gán gói cho vai trò", async () => {
        await d.go("Vai trò & phân quyền", "/admin/rbac",
          "Gói được gán cho <b>vai trò</b>: mở mục <b>Vai trò & phân quyền</b>")
        const menu = page.getByRole("button", { name: `Hành động cho ${role}` }).first()
        await menu.waitFor({ timeout: 20_000 })
        await d.hint(page.getByRole("row", { name: new RegExp(role) }).first(),
          `Vai trò <b>${role}</b>: cùng quyền với USER, dùng cho giảng viên trong demo`)
        await d.press(menu, "Mở menu thao tác của vai trò")
        await d.press(page.getByRole("menuitem", { name: "Chỉnh sửa" }), "Chọn <b>Chỉnh sửa</b>",
          { ms: 1500 })
        await page.locator("#role-usage-plan").waitFor({ timeout: 20_000 })
        await page.waitForTimeout(1200)
        await d.choose(page.locator("#role-usage-plan"), plan,
          `Ô <b>Gói hạn mức</b>: chọn gói vừa tạo "${plan}"`)
        await d.tip(d.tour("role-form-usage-plan"),
          "Hạn mức được gán <b>theo vai trò</b>. Gói <b>Mặc định</b> áp dụng cho khách và các " +
            "vai trò chưa được gán gói.", { ms: 7000 })
        await d.press(submit(d, "Lưu thay đổi"), "Bấm <b>Lưu thay đổi</b>")
        await page.waitForTimeout(1200)
      })

      await d.scene("3: gán vai trò cho người dùng", async () => {
        await editUser(d, state.userCode)
        await d.choose(page.locator("#user-role"), new RegExp(`^${role}`),
          `Ô <b>Vai trò</b>: chọn ${role}`)
        await d.tip(d.tour("user-form-role"),
          `Tài khoản ${state.userCode} được gán vai trò ${role}, nên dùng gói "${plan}".`)
        await d.press(submit(d, "Lưu thay đổi"), "Bấm <b>Lưu thay đổi</b>")
        await page.waitForTimeout(1200)
      })

      await d.scene("4: dùng đến khi hết hạn mức", async () => {
        await d.label(null)
        await d.logout("admin")
        await d.tourSeen("demoGv")
        await d.login("demoGv")
        const warning = page.getByRole("status").filter({ hasText: "Sắp hết hạn mức sử dụng" })
        const blocked = page.getByText(/Bạn đã dùng hết hạn mức/).last()
        let warned = false
        for (const question of [Q.seminar, Q.advisorDeadline, Q.thesis, Q.fee,
          Q.scholarshipGuest, Q.englishK22]) {
          await d.newChat()
          await d.label("Tình huống 2 · Người dùng hỏi đến khi hết hạn mức", WHO)
          await d.ask(question)
          await page.waitForTimeout(1500)
          if (await blocked.isVisible().catch(() => false)) {
            await d.tip(blocked,
              "Khi hết hạn mức, yêu cầu mới bị tạm chặn. Hệ thống cho biết thời điểm hạn mức " +
                "được làm mới.", { ms: 8000 })
            return
          }
          if (!warned && (await warning.isVisible().catch(() => false))) {
            warned = true
            await d.tip(warning, "Khi đã dùng từ 80% hạn mức, người dùng được cảnh báo trước.",
              { ms: 6500 })
          }
        }
        throw new Error("the plan was never exhausted - lower DEMO_DAILY_TOKENS")
      })

      await d.scene("5: theo dõi phía quản trị", async () => {
        await d.label(null)
        await d.logout("demoGv")
        await d.login("admin")
        const row = await userRow(d, state.userCode)
        await d.press(row.getByRole("button", { name: /^Hành động cho/ }),
          "Mở menu thao tác của tài khoản")
        await d.press(page.getByRole("menuitem", { name: "Xem chi tiết" }),
          "Chọn <b>Xem chi tiết</b>", { ms: 1500 })
        const usage = d.tour("user-detail-usage")
        await usage.waitFor({ timeout: 20_000 })
        await page.waitForTimeout(1200)
        await d.label("Tình huống 3 · Theo dõi mức sử dụng", ADMIN)
        await d.tip(usage,
          "Quản trị viên theo dõi mức sử dụng của từng người dùng và thời điểm hạn mức được " +
            "làm mới.", { ms: 6500 })
      })

      await d.scene("kết", async () => {
        await d.label(null)
        await d.card("Tóm tắt", [
          "Hạn mức theo 24 giờ và 7 ngày, gán theo vai trò.",
          "Cảnh báo khi đã dùng 80%; tạm chặn khi hết, kèm thời điểm làm mới.",
          "Quản trị viên theo dõi mức sử dụng của từng người dùng.",
        ], 7000, { keep: true })
      })
    }
  )
}
