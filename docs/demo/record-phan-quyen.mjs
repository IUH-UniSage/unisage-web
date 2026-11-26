// Quay video demo "Phân quyền tài liệu trong UniSage" theo docs/demo/kich-ban-demo-phan-quyen.md.
// Tooltip và khung intro/outro là lớp phủ chèn vào trang lúc quay - không sửa code của app.
//
//   node docs/demo/record-phan-quyen.mjs [thư-mục-xuất] [đường-dẫn-logo]
//
// Cần: web ở http://localhost:5173 (đúng cổng này - CORS của gateway), gateway :8400.

import fs from "node:fs"
import path from "node:path"

import { chromium } from "@playwright/test"

const BASE = "http://localhost:5173"
const API = "http://localhost:8400/api/v1/master"
const OUT = path.resolve(process.argv[2] ?? "output/demo")
const LOGO_FILE = process.argv[3] ?? "/home/huy/Main/image.png"
const LOGO = `data:image/png;base64,${fs.readFileSync(LOGO_FILE).toString("base64")}`

const ACCOUNTS = {
  cnpmL0: ["TST-CNPM-L0", "Test@2026"],
  cnpmL2: ["TST-CNPM-L2", "Test@2026"],
  ktL5: ["TST-KT-L5", "Test@2026"],
  admin: ["SA-001", "123123"],
}
// A2 - Quy chế chấm khóa luận BM CNPM (cấp tối thiểu 2).
const DOC_A2 = "25546455-fd87-4dfc-88c3-3e7444029a9d"

const Q = {
  scholarship: "hoc bong loai gioi can gpa hk va drl bao nhieu",
  seminar: "seminar bo mon cnpm nam 26-27 to chuc luc may gio, phong nao vay",
  thesis: "diem khoa luan ktpm tinh trong so gvhd, phan bien, hoi dong the nao",
  observation: "gv moi bm ke toan phai duoc du gio it nhat may tiet nam 26-27",
}

const TOTAL_STEPS = 15
let step = 0
const t0 = Date.now()
const log = (message) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${message}`)

// ---------------------------------------------------------------- page-side overlay

function installOverlay() {
  const ROOT = "__demo_overlay__"
  const clear = () => document.getElementById(ROOT)?.remove()
  const root = () => {
    clear()
    const el = document.createElement("div")
    el.id = ROOT
    Object.assign(el.style, {
      position: "fixed", inset: "0", zIndex: "2147483647", pointerEvents: "none",
      fontFamily: "Inter, 'Segoe UI', Roboto, Arial, sans-serif",
    })
    document.body.appendChild(el)
    return el
  }
  window.__demoClear = clear
  window.__demoCard = ({ logo, title, lines }) => {
    const el = root()
    el.innerHTML = `
      <div style="position:absolute;inset:0;background:#1f3f94;display:flex;flex-direction:column;
                  align-items:center;justify-content:center;gap:28px;color:#fff;text-align:center">
        <img src="${logo}" style="width:600px;max-width:70vw;border-radius:14px;
                  box-shadow:0 18px 50px rgba(0,0,0,.35)">
        <div style="font-size:38px;font-weight:700;letter-spacing:.2px">${title}</div>
        <div style="font-size:21px;line-height:1.6;max-width:900px;opacity:.95">${lines.join("<br>")}</div>
      </div>`
  }
  window.__demoTip = ({ box, text, step, total, place }) => {
    const el = root()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const pad = 8
    if (box && box.width > 0 && box.height > 0) {
      const ring = document.createElement("div")
      Object.assign(ring.style, {
        position: "absolute", left: `${box.x - pad}px`, top: `${box.y - pad}px`,
        width: `${box.width + pad * 2}px`, height: `${box.height + pad * 2}px`,
        border: "3px solid #f5b400", borderRadius: "12px",
        boxShadow: "0 0 0 9999px rgba(15,23,42,.22)",
      })
      el.appendChild(ring)
    } else {
      el.style.background = "rgba(15,23,42,.38)"
    }
    const bubble = document.createElement("div")
    Object.assign(bubble.style, {
      position: "absolute", maxWidth: "380px", background: "#fff", color: "#0f172a",
      borderRadius: "14px", padding: "16px 18px", fontSize: "17px", lineHeight: "1.5",
      boxShadow: "0 16px 40px rgba(15,23,42,.35)", borderTop: "5px solid #1f3f94",
    })
    bubble.innerHTML = `<div style="font-size:13px;font-weight:700;color:#1f3f94;margin-bottom:6px">
      HƯỚNG DẪN · ${step}/${total}</div><div>${text}</div>`
    el.appendChild(bubble)
    const bw = Math.min(380, vw - 32)
    const bh = bubble.getBoundingClientRect().height
    let left
    let top
    if (box && box.width > 0 && box.height > 0) {
      const below = box.y + box.height + pad + 18
      const above = box.y - pad - 18 - bh
      const goBelow = place === "bottom" ? below + bh < vh || above < 0 : above < 0
      top = goBelow ? below : above
      left = Math.min(Math.max(box.x + box.width / 2 - bw / 2, 16), vw - bw - 16)
      const arrow = document.createElement("div")
      const ax = Math.min(Math.max(box.x + box.width / 2, left + 24), left + bw - 24)
      Object.assign(arrow.style, {
        position: "absolute", left: `${ax - 10}px`, width: "0", height: "0",
        borderLeft: "10px solid transparent", borderRight: "10px solid transparent",
        ...(goBelow
          ? { top: `${top - 10}px`, borderBottom: "10px solid #1f3f94" }
          : { top: `${top + bh}px`, borderTop: "10px solid #fff" }),
      })
      el.appendChild(arrow)
    } else {
      left = vw / 2 - bw / 2
      top = vh / 2 - bh / 2
    }
    Object.assign(bubble.style, { left: `${left}px`, top: `${top}px`, width: `${bw}px` })
  }
}

// ---------------------------------------------------------------- helpers

async function overlayReady(page) {
  await page.waitForFunction(() => typeof window.__demoTip === "function" && document.body)
}

async function card(page, title, lines, ms) {
  await overlayReady(page)
  await page.evaluate((args) => window.__demoCard(args), { logo: LOGO, title, lines })
  await page.waitForTimeout(ms)
  await page.evaluate(() => window.__demoClear())
}

// Tooltip pointing at `locator` (falls back to `fallback`, then to the screen center).
async function tip(page, locator, text, { place = "bottom", ms = 4800, fallback } = {}) {
  step += 1
  let box = null
  for (const candidate of [locator, fallback].filter(Boolean)) {
    const target = candidate.last()
    if ((await target.count()) === 0) continue
    await target.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {})
    box = await target.boundingBox().catch(() => null)
    if (box && box.width > 0 && box.height > 0) break
  }
  await overlayReady(page)
  await page.evaluate((args) => window.__demoTip(args), {
    box, text, step, total: TOTAL_STEPS, place,
  })
  log(`tooltip ${step}/${TOTAL_STEPS}${box ? "" : " (centered)"}: ${text.replace(/<[^>]+>/g, "")}`)
  await page.waitForTimeout(ms)
  await page.evaluate(() => window.__demoClear())
}

const tour = (page, name) => page.locator(`[data-tour="${name}"]`)
const replyActions = (page) => tour(page, "chat-reply-actions")
const citations = (page) => tour(page, "chat-reply-citations")

async function waitForAnswer(page) {
  const stop = page.getByRole("button", { name: "Dừng tạo câu trả lời" })
  await stop.first().waitFor({ state: "visible", timeout: 20_000 }).catch(() => {})
  await stop.first().waitFor({ state: "hidden", timeout: 240_000 })
  await replyActions(page).last().waitFor({ state: "visible", timeout: 30_000 }).catch(() => {})
  await page.waitForTimeout(1800)
}

async function typeAndSend(page, input, text) {
  await input.click()
  await input.pressSequentially(text, { delay: 45 })
  await page.waitForTimeout(400)
  await input.press("Enter")
  log(`asked: ${text}`)
  await waitForAnswer(page)
  const answer = await page.locator("main").last().innerText().catch(() => "")
  log(`answer tail: ${answer.slice(-220).replace(/\s+/g, " ")}`)
}

// Only the visible composer: a guest chat page also renders a hidden one under the same label.
const composer = (page) => page.locator('textarea[aria-label="Tin nhắn gửi UniSage"]:visible').first()
const ask = (page, text) => typeAndSend(page, composer(page), text)

async function newChat(page) {
  await page.goto(`${BASE}/chat`)
  await composer(page).waitFor({ timeout: 20_000 })
  await page.waitForTimeout(800)
}

async function login(page, [code, password], { tipOnCode } = {}) {
  await page.goto(`${BASE}/login`)
  await page.locator("#code").waitFor()
  await page.waitForTimeout(600)
  if (tipOnCode) await tip(page, page.locator("#code"), tipOnCode)
  await page.locator("#code").pressSequentially(code, { delay: 70 })
  await page.locator("#password").pressSequentially(password, { delay: 70 })
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click()
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 })
  await page.waitForTimeout(1200)
  log(`logged in as ${code} -> ${page.url()}`)
}

async function logout(page, fullName) {
  try {
    // The chat sidebar's account menu is a button showing the user's name (no aria-label);
    // other pages have the header's "Tài khoản" button.
    const sidebar = page.locator('button[aria-haspopup="menu"]', { hasText: fullName })
    const trigger = (await sidebar.count()) ? sidebar : page.getByRole("button", { name: "Tài khoản" })
    await trigger.filter({ visible: true }).first().click({ timeout: 5000 })
    await page.getByRole("menuitem", { name: "Đăng xuất" }).click({ timeout: 5000 })
    await page.waitForURL(`${BASE}/`, { timeout: 15_000 })
  } catch {
    log("logout via menu failed - clearing the session instead")
    await page.context().clearCookies()
    await page.evaluate(() => {
      const keep = window.localStorage.getItem("unisage_product_tour_seen")
      window.localStorage.clear()
      if (keep) window.localStorage.setItem("unisage_product_tour_seen", keep)
    })
    await page.goto(`${BASE}/`)
  }
  await page.waitForTimeout(800)
}

async function profileOf([code, password]) {
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, password }),
  })
  const body = await response.json()
  const token = (body.data ?? body).accessToken
  const data = body.data ?? body
  return {
    id: JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).sub,
    fullName: data.fullName,
  }
}

async function scene(name, run) {
  log(`=== ${name}`)
  try {
    await run()
  } catch (error) {
    log(`!!! ${name} failed: ${error.message.split("\n")[0]}`)
    await page.screenshot({ path: path.join(OUT, `loi-${name.split(":")[0]}.png`) }).catch(() => {})
  }
}

// ---------------------------------------------------------------- run

fs.mkdirSync(OUT, { recursive: true })
const profiles = Object.fromEntries(
  await Promise.all(Object.entries(ACCOUNTS).map(async ([key, acc]) => [key, await profileOf(acc)]))
)
const ids = Object.fromEntries(Object.entries(profiles).map(([key, p]) => [key, p.id]))
const tourKeys = Object.values(ids).flatMap((id) =>
  ["system-admin", "ingester", "client"].map((audience) => `overview:${audience}:${id}`)
)

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  locale: "vi-VN",
})
await context.addInitScript((keys) => {
  window.localStorage.setItem("unisage_product_tour_seen", JSON.stringify(keys))
}, tourKeys)
await context.addInitScript(installOverlay)
const page = await context.newPage()
let shareUrl = null

await scene("0: mở đầu", async () => {
  await page.goto(`${BASE}/`)
  await page.waitForLoadState("networkidle").catch(() => {})
  await card(page, "Phân quyền tài liệu trong UniSage", [
    "Mỗi người chỉ nhận câu trả lời từ những tài liệu mình được phép xem.",
  ], 5000)
})

await scene("1: khách hỏi quy định chung", async () => {
  const homeAsk = page.getByLabel("Hỏi UniSage")
  await tip(page, tour(page, "home-ask"),
    "Chưa đăng nhập bạn vẫn hỏi được về các <b>quy định chung</b> của Trường.")
  await typeAndSend(page, homeAsk, Q.scholarship)
  await tip(page, citations(page),
    "Câu trả lời lấy từ một tài liệu <b>công khai</b>. Ai cũng xem được.",
    { fallback: replyActions(page), place: "bottom" })
})

await scene("2: khách hỏi tài liệu nội bộ", async () => {
  // A new conversation from the home page: a guest's composer stays locked after the first
  // answer of a conversation (app bug, 23-11-2026), so the follow-up can't be asked in place.
  await page.goto(`${BASE}/`)
  await typeAndSend(page, page.getByLabel("Hỏi UniSage"), Q.seminar)
  await tip(page, replyActions(page),
    "Lịch seminar là tài liệu <b>nội bộ</b> của Bộ môn Công nghệ Phần mềm. Khách không xem được, " +
      "nên UniSage không dùng nó để trả lời.", { place: "bottom", ms: 6000 })
  await tip(page, tour(page, "chat-guest-sign-in"), "Đăng nhập để xem tài liệu của đơn vị bạn.")
})

await scene("3: đăng nhập, xem cấp truy cập", async () => {
  await login(page, ACCOUNTS.cnpmL0, {
    tipOnCode: "Đăng nhập bằng <b>mã giảng viên hoặc mã sinh viên</b> do Trường cấp.",
  })
  await page.goto(`${BASE}/profile`)
  await tour(page, "profile-account").waitFor({ timeout: 15_000 })
  await tip(page, tour(page, "profile-account"),
    "Đây là <b>cấp truy cập</b> của bạn. Tài khoản này thuộc Bộ môn Công nghệ Phần mềm, cấp 0.",
    { ms: 5500 })
})

await scene("4: đúng bộ môn, đủ cấp", async () => {
  await newChat(page)
  await ask(page, Q.seminar)
  await tip(page, citations(page),
    "Cùng bộ môn, cấp của bạn (0) ≥ cấp tối thiểu của tài liệu (0), nên <b>xem được</b>.",
    { fallback: replyActions(page), place: "bottom", ms: 5500 })
  const share = page.getByRole("button", { name: "Chia sẻ đoạn chat" }).first()
  await tip(page, share, "Bạn có thể <b>chia sẻ</b> đoạn chat cho đồng nghiệp.")
  await share.click()
  await page.getByRole("button", { name: "Tạo liên kết" }).click()
  const link = page.getByLabel("Liên kết chia sẻ")
  await link.waitFor({ timeout: 15_000 })
  shareUrl = await link.inputValue()
  log(`share url: ${shareUrl}`)
  await page.waitForTimeout(1500)
  await page.keyboard.press("Escape")
})

await scene("5: đúng bộ môn, chưa đủ cấp", async () => {
  await newChat(page)
  await ask(page, Q.thesis)
  await tip(page, replyActions(page),
    "Quy chế chấm khóa luận yêu cầu <b>cấp 2</b>. Bạn đang ở cấp 0 nên chưa xem được, dù cùng bộ môn.",
    { place: "bottom", ms: 5500 })
})

await scene("6: cấp cao hơn thì xem được", async () => {
  await logout(page, profiles.cnpmL0.fullName)
  await login(page, ACCOUNTS.cnpmL2)
  await newChat(page)
  await ask(page, Q.thesis)
  await tip(page, citations(page),
    "Ở <b>cấp 2</b>, bạn xem được tài liệu cấp 0, 1 và 2 của bộ môn mình.",
    { fallback: replyActions(page), place: "bottom" })
})

await scene("7: cấp cao nhất, khác bộ môn", async () => {
  await logout(page, profiles.cnpmL2.fullName)
  await login(page, ACCOUNTS.ktL5)
  await newChat(page)
  await ask(page, Q.seminar)
  await tip(page, replyActions(page),
    "Cấp 5 là cấp cao nhất, nhưng lịch seminar thuộc <b>Bộ môn Công nghệ Phần mềm</b>. " +
      "Khác đơn vị thì vẫn không xem được.", { place: "bottom", ms: 6000 })
  await ask(page, Q.observation)
  await tip(page, citations(page), "Tài liệu của chính <b>Bộ môn Kế toán</b> thì xem được ngay.",
    { fallback: replyActions(page), place: "bottom" })
})

await scene("8: chia sẻ không làm lộ tài liệu", async () => {
  if (!shareUrl) throw new Error("no share link from scene 4")
  await page.goto(shareUrl)
  const chip = page.locator("span", { hasText: /^Nguồn:$/ }).first().locator("xpath=..").locator("button")
  await chip.first().waitFor({ timeout: 20_000 })
  await page.waitForTimeout(1200)
  await chip.first().click()
  const denied = page.getByText("Bạn không có quyền xem tài liệu này.")
  await denied.waitFor({ timeout: 20_000 })
  await page.waitForTimeout(800)
  await tip(page, denied, "Người được chia sẻ vẫn bị <b>kiểm tra quyền</b> khi mở tài liệu gốc.",
    { place: "bottom", ms: 5500 })
})

await scene("9: ai cấp quyền cho bạn", async () => {
  await logout(page, profiles.ktL5.fullName)
  await login(page, ACCOUNTS.admin)
  await page.goto(`${BASE}/admin/users/${ids.cnpmL2}`)
  await tour(page, "user-detail-departments").waitFor({ timeout: 20_000 })
  await page.waitForTimeout(1000)
  await tip(page, tour(page, "user-detail-departments"),
    "Quản trị viên gán cho mỗi người: <b>phòng ban</b> và <b>cấp truy cập</b>.", { ms: 5500 })
  await page.goto(`${BASE}/admin/documents/${DOC_A2}/edit`)
  await tour(page, "document-form-classification").waitFor({ timeout: 20_000 })
  await page.waitForTimeout(1000)
  await tip(page, tour(page, "document-form-classification"),
    "Mỗi tài liệu nội bộ có phòng ban và <b>cấp độ truy cập tối thiểu</b>. " +
      "Tài liệu công khai thì không cần.", { ms: 6000 })
})

await scene("10: tổng kết", async () => {
  await card(page, "Tóm tắt", [
    "Tài liệu <b>công khai</b>: ai cũng xem được.",
    "Tài liệu <b>nội bộ</b>: đúng đơn vị <b>và</b> đủ cấp truy cập.",
    "Thiếu thông tin cần thiết? Liên hệ đơn vị để được cấp quyền,",
    "hoặc bấm “Báo cáo câu trả lời này” dưới câu trả lời.",
  ], 7000)
})

const video = page.video()
await context.close()
const target = path.join(OUT, "demo-phan-quyen.webm")
await video.saveAs(target)
await video.delete()
await browser.close()
log(`video: ${target} (${step}/${TOTAL_STEPS} tooltips shown)`)
