// Shared helpers for the demo-video scripts in docs/demo: one recorded browser context per
// video, an overlay for tooltips and title cards (injected while recording - the app's code is
// not touched), and the login / ask / logout steps every video uses.

import fs from "node:fs"
import path from "node:path"

import { execFileSync } from "node:child_process"

import { chromium } from "@playwright/test"

export const BASE = "http://localhost:5173"
export const API = "http://localhost:8400/api/v1/master"

export const ACCOUNTS = {
  cnpmL0: ["TST-CNPM-L0", "Test@2026"],
  cnpmL1: ["TST-CNPM-L1", "Test@2026"],
  cnpmL2: ["TST-CNPM-L2", "Test@2026"],
  cnpmL3: ["TST-CNPM-L3", "Test@2026"],
  ktL5: ["TST-KT-L5", "Test@2026"],
  admin: ["SA-001", "123123"],
}

const t0 = Date.now()
export const log = (message) =>
  console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${message}`)

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
  // Scenario label ("Tình huống n · ..."), kept in sessionStorage so it survives navigation.
  const LABEL = "__demo_label__"
  const drawLabel = () => {
    if (window.top !== window) return // not inside the document viewer's frame
    document.getElementById(LABEL)?.remove()
    const raw = window.sessionStorage.getItem(LABEL)
    if (!raw || !document.body) return
    const { title, sub } = JSON.parse(raw)
    const el = document.createElement("div")
    el.id = LABEL
    Object.assign(el.style, {
      position: "fixed", top: "12px", left: "50%", transform: "translateX(-50%)",
      zIndex: "2147483646", pointerEvents: "none", background: "#1f3f94", color: "#fff",
      borderRadius: "12px", padding: "8px 18px", textAlign: "center",
      boxShadow: "0 8px 24px rgba(15,23,42,.3)",
      fontFamily: "Inter, 'Segoe UI', Roboto, Arial, sans-serif",
    })
    el.innerHTML = `<div style="font-size:16px;font-weight:700">${title}</div>` +
      (sub ? `<div style="font-size:13px;opacity:.9;margin-top:2px">${sub}</div>` : "")
    document.body.appendChild(el)
  }
  window.__demoLabel = (value) => {
    if (value) window.sessionStorage.setItem(LABEL, JSON.stringify(value))
    else window.sessionStorage.removeItem(LABEL)
    drawLabel()
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", drawLabel)
  else drawLabel()
  // Title cards are kept in sessionStorage too and redrawn on load: a reload under a card
  // (Vite's dependency re-optimisation, 25/11/2026) otherwise left the bare app page on screen.
  const CARD = "__demo_card__"
  window.__demoCardClear = () => {
    window.sessionStorage.removeItem(CARD)
    clear()
  }
  window.__demoCard = (args) => {
    window.sessionStorage.setItem(CARD, JSON.stringify(args))
    drawCard(args)
  }
  const redrawCard = () => {
    if (window.top !== window || !document.body) return
    const raw = window.sessionStorage.getItem(CARD)
    if (raw) drawCard(JSON.parse(raw))
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", redrawCard)
  else redrawCard()
  // A short caption on the element about to be used (typed into, picked, clicked): unlike
  // a tooltip it has no step number and only explains the action.
  window.__demoHint = ({ box, text }) => {
    const el = root()
    if (!box) return
    const pad = 6
    const ring = document.createElement("div")
    Object.assign(ring.style, {
      position: "absolute", left: `${box.x - pad}px`, top: `${box.y - pad}px`,
      width: `${box.width + pad * 2}px`, height: `${box.height + pad * 2}px`,
      border: "3px solid #f5b400", borderRadius: "10px",
      boxShadow: "0 0 0 4px rgba(245,180,0,.25)",
    })
    el.appendChild(ring)
    if (!text) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const caption = document.createElement("div")
    Object.assign(caption.style, {
      position: "absolute", maxWidth: "440px", background: "#0f172a", color: "#fff",
      borderRadius: "10px", padding: "9px 14px", fontSize: "16px", lineHeight: "1.45",
      boxShadow: "0 10px 28px rgba(15,23,42,.35)",
    })
    caption.innerHTML = text
    el.appendChild(caption)
    const { width, height } = caption.getBoundingClientRect()
    const below = box.y + box.height + pad + 10
    const above = box.y - pad - 10 - height
    let top = below + height <= vh - 8 ? below : above >= 8 ? above : box.y
    let left = Math.min(Math.max(box.x, 16), vw - width - 16)
    if (top === box.y) left = Math.min(box.x + box.width + pad + 12, vw - width - 16)
    Object.assign(caption.style, { left: `${left}px`, top: `${top}px` })
  }
  function drawCard({ logo, title, lines, showLogo }) {
    const el = root()
    el.innerHTML = `
      <div style="position:absolute;inset:0;background:#1f3f94;display:flex;flex-direction:column;
                  align-items:center;justify-content:center;gap:26px;color:#fff;text-align:center">
        ${showLogo ? `<img src="${logo}" style="width:560px;max-width:70vw;border-radius:14px;
                  box-shadow:0 18px 50px rgba(0,0,0,.35)">` : ""}
        <div style="font-size:38px;font-weight:700">${title}</div>
        <div style="font-size:22px;line-height:1.65;max-width:${showLogo ? 960 : 1360}px;opacity:.95">${lines.join("<br>")}</div>
      </div>`
  }
  window.__demoTip = ({ box, text, step, total, side }) => {
    const el = root()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const pad = 8
    const hasBox = box && box.width > 0 && box.height > 0
    if (hasBox) {
      const ring = document.createElement("div")
      Object.assign(ring.style, {
        position: "absolute", left: `${box.x - pad}px`, top: `${box.y - pad}px`,
        width: `${box.width + pad * 2}px`, height: `${box.height + pad * 2}px`,
        border: "3px solid #f5b400", borderRadius: "12px",
        boxShadow: "0 0 0 9999px rgba(15,23,42,.22)",
      })
      el.appendChild(ring)
    } else {
      el.style.background = "rgba(15,23,42,.22)"
    }
    const bubble = document.createElement("div")
    Object.assign(bubble.style, {
      position: "absolute", background: "#fff", color: "#0f172a", borderRadius: "14px",
      padding: "16px 18px", fontSize: "17px", lineHeight: "1.55",
      boxShadow: "0 16px 40px rgba(15,23,42,.35)", borderTop: "5px solid #1f3f94",
    })
    const bw = Math.min(390, vw - 32)
    bubble.style.width = `${bw}px`
    bubble.innerHTML = `<div style="font-size:13px;font-weight:700;color:#1f3f94;margin-bottom:6px">
      Bước ${step}/${total}</div><div>${text}</div>`
    el.appendChild(bubble)
    const bh = bubble.getBoundingClientRect().height
    let left = vw / 2 - bw / 2
    let top = vh / 2 - bh / 2
    const tall = hasBox && box.height > vh * 0.42
    if (hasBox && (side === "beside" || tall)) {
      // A long answer: the bubble goes beside it (right, else left - over the sidebar),
      // so the text being explained stays readable.
      const arrow = document.createElement("div")
      Object.assign(arrow.style, { position: "absolute", width: "0", height: "0" })
      const rightRoom = vw - (box.x + box.width + pad + 18)
      const onRight = rightRoom >= bw + 16 || box.x - pad - 18 < bw + 16
      left = onRight
        ? Math.min(box.x + box.width + pad + 18, vw - bw - 16)
        : box.x - pad - 18 - bw
      top = Math.min(Math.max(box.y + box.height / 2 - bh / 2, 16), vh - bh - 16)
      Object.assign(arrow.style, {
        top: `${top + 22}px`,
        borderTop: "10px solid transparent", borderBottom: "10px solid transparent",
        ...(onRight
          ? { left: `${left - 10}px`, borderRight: "10px solid #fff" }
          : { left: `${left + bw}px`, borderLeft: "10px solid #fff" }),
      })
      el.appendChild(arrow)
    } else if (hasBox) {
      // Below the element, else above it; a tall element (a whole sidebar) gets it on its
      // right side instead, so the bubble never leaves the screen.
      const below = box.y + box.height + pad + 18
      const above = box.y - pad - 18 - bh
      const arrow = document.createElement("div")
      Object.assign(arrow.style, { position: "absolute", width: "0", height: "0" })
      if (below + bh <= vh - 8 || above >= 8) {
        const goBelow = below + bh <= vh - 8
        top = goBelow ? below : above
        left = Math.min(Math.max(box.x + box.width / 2 - bw / 2, 16), vw - bw - 16)
        const ax = Math.min(Math.max(box.x + box.width / 2, left + 24), left + bw - 24)
        Object.assign(arrow.style, {
          left: `${ax - 10}px`,
          borderLeft: "10px solid transparent", borderRight: "10px solid transparent",
          ...(goBelow
            ? { top: `${top - 10}px`, borderBottom: "10px solid #1f3f94" }
            : { top: `${top + bh}px`, borderTop: "10px solid #fff" }),
        })
      } else {
        left = Math.min(box.x + box.width + pad + 18, vw - bw - 16)
        top = Math.min(Math.max(box.y + 24, 16), vh - bh - 16)
        Object.assign(arrow.style, {
          left: `${left - 10}px`, top: `${top + 22}px`,
          borderTop: "10px solid transparent", borderBottom: "10px solid transparent",
          borderRight: "10px solid #fff",
        })
      }
      el.appendChild(arrow)
    }
    Object.assign(bubble.style, { left: `${left}px`, top: `${top}px` })
  }
}

async function tokenOf([code, password]) {
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, password }),
  })
  const body = await response.json()
  return (body.data ?? body).accessToken
}

/** Calls the master API as `key` (an ACCOUNTS entry); returns the response's `data`. */
export async function api(key, method, pathname, body) {
  const token = await tokenOf(ACCOUNTS[key])
  const response = await fetch(`${API}${pathname}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok || (json.code && json.code !== 1000)) {
    throw new Error(`${method} ${pathname}: ${response.status} ${json.message ?? ""}`)
  }
  return json.data
}

/**
 * Deletes the account's conversations whose title is one of `titles` - the ones earlier
 * recordings created - so the sidebar history starts clean. Nothing else is touched.
 */
export async function clearDemoConversations(key, titles) {
  const token = await tokenOf(ACCOUNTS[key])
  const headers = { Authorization: `Bearer ${token}` }
  const response = await fetch(`${API}/conversations?page=1&limit=100`, { headers })
  const body = await response.json()
  const items = body.data?.data ?? body.data ?? []
  const wanted = new Set(titles.map((title) => title.trim().toLowerCase()))
  let deleted = 0
  for (const item of items) {
    if (!wanted.has(String(item.title ?? "").trim().toLowerCase())) continue
    const res = await fetch(`${API}/conversations/${item.id}`, { method: "DELETE", headers })
    if (res.ok) deleted += 1
  }
  log(`cleared ${deleted} earlier demo conversation(s) of ${ACCOUNTS[key][0]}`)
}

async function profileOf([code, password]) {
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, password }),
  })
  const body = await response.json()
  const data = body.data ?? body
  const sub = JSON.parse(Buffer.from(data.accessToken.split(".")[1], "base64url").toString()).sub
  return { id: sub, fullName: data.fullName }
}

/**
 * Starts one video: `run(demo)` drives the page, then the recording is saved as
 * `<outDir>/<name>.webm`. `totalSteps` numbers the tooltips "n/total".
 */
export async function recordVideo(
  { name, outDir, logoFile, totalSteps, accounts = [], record = true },
  run
) {
  fs.mkdirSync(outDir, { recursive: true })
  const logo = `data:image/png;base64,${fs.readFileSync(logoFile).toString("base64")}`
  const profiles = Object.fromEntries(
    await Promise.all(accounts.map(async (key) => [key, await profileOf(ACCOUNTS[key])]))
  )
  const tourKeys = Object.values(profiles).flatMap(({ id }) =>
    ["system-admin", "ingester", "client"].map((audience) => `overview:${audience}:${id}`)
  )
  // Headless Chromium has no PDF viewer, so the source drawer would stay blank: run the
  // scripts under `xvfb-run -a -s "-screen 0 1440x900x24"` and the browser opens headed.
  const browser = await chromium.launch({ headless: !process.env.DISPLAY })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...(record ? { recordVideo: { dir: outDir, size: { width: 1440, height: 900 } } } : {}),
    locale: "vi-VN",
  })
  // Merged, not overwritten: tourSeen() adds accounts created during the recording.
  await context.addInitScript((keys) => {
    let seen = []
    try {
      seen = JSON.parse(window.localStorage.getItem("unisage_product_tour_seen") ?? "[]")
    } catch {}
    const all = [...new Set([...(Array.isArray(seen) ? seen : []), ...keys])]
    window.localStorage.setItem("unisage_product_tour_seen", JSON.stringify(all))
  }, tourKeys)
  await context.addInitScript(installOverlay)
  // Stored documents are served through a VS Code dev tunnel (*.devtunnels.ms), which shows
  // a "You are about to connect to a developer tunnel" page inside the document viewer. This
  // header is the tunnel's documented way for non-browser clients to skip that page.
  await context.route(/\.devtunnels\.ms\//, (route) =>
    route.continue({
      headers: { ...route.request().headers(), "X-Tunnel-Skip-AntiPhishing-Page": "True" },
    })
  )
  const page = await context.newPage()
  // Seconds into the video; waits longer than CUT_AFTER are cut out after recording.
  const videoStart = Date.now()
  const vt = () => (Date.now() - videoStart) / 1000
  const cuts = []
  const CUT_AFTER = 8
  page.on("crash", () => log("!!! page crashed"))
  page.on("close", () => log("page closed"))
  browser.on("disconnected", () => log("browser closed"))
  let step = 0
  let failures = 0
  // Record only the app on localhost: a tunnel URL (cloudflared, VS Code port forwarding)
  // would show its own confirmation / GitHub sign-in page in the video.
  page.on("framenavigated", (frame) => {
    const url = frame.url()
    if (url === "about:blank" || url.startsWith(BASE)) return
    if (frame === page.mainFrame()) {
      failures += 1
      log(`!!! left ${BASE}: ${url}`)
      return
    }
    // A sub-frame (the document viewer) may load from elsewhere, but must not show a
    // tunnel / sign-in interstitial.
    if (/github\.com|login\.microsoftonline\.com/.test(url)) {
      failures += 1
      log(`!!! sign-in page in a frame: ${url}`)
      return
    }
    frame.waitForLoadState("domcontentloaded").then(() => frame.content()).then((html) => {
      if (/about to connect to a developer tunnel|Sign in to GitHub/i.test(html.slice(0, 20_000))) {
        failures += 1
        log(`!!! tunnel interstitial in a frame: ${url}`)
      }
    }).catch(() => {})
  })

  const ready = () =>
    page.waitForFunction(() => typeof window.__demoTip === "function" && document.body)

  /** The on-screen box of the first of `locators` that is visible (scrolled into view). */
  async function boxOf(locators, { last = true } = {}) {
    for (const candidate of locators.filter(Boolean)) {
      const target = last ? candidate.last() : candidate.first()
      if ((await target.count()) === 0) continue
      await target.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {})
      let box = await target.boundingBox().catch(() => null)
      if (box) {
        // Only the part on screen is ringed (a long answer runs past the viewport).
        const top = Math.max(box.y, 64)
        const bottom = Math.min(box.y + box.height, 900 - 8)
        box = { ...box, y: top, height: Math.max(bottom - top, 0) }
      }
      if (box && box.width > 0 && box.height > 0) return box
    }
    return null
  }
  const pause = (ms) => page.waitForTimeout(record ? ms : Math.min(ms, 200))

  const demo = {
    page,
    profiles,
    tour: (anchor) => page.locator(`[data-tour="${anchor}"]`),
    composer: () => page.locator('textarea[aria-label="Tin nhắn gửi UniSage"]:visible').first(),
    /** Marks the product tour as seen for `key` (an account created during the video). */
    async tourSeen(key) {
      const { id } = await profileOf(ACCOUNTS[key])
      const keys = ["system-admin", "ingester", "client"].map((a) => `overview:${a}:${id}`)
      await page.evaluate((add) => {
        let seen = []
        try {
          seen = JSON.parse(window.localStorage.getItem("unisage_product_tour_seen") ?? "[]")
        } catch {}
        const all = [...new Set([...(Array.isArray(seen) ? seen : []), ...add])]
        window.localStorage.setItem("unisage_product_tour_seen", JSON.stringify(all))
      }, keys)
    },

    /** The newest assistant reply: its text, sources and action row. */
    answer: () => page.locator('[data-tour="chat-reply-actions"]').last().locator("xpath=.."),

    /** Scenario label at the top of the screen; `label(null)` removes it. */
    async label(title, sub) {
      await ready()
      await page.evaluate((value) => window.__demoLabel(value), title ? { title, sub } : null)
      log(`label: ${title ?? "(none)"}${sub ? ` - ${sub}` : ""}`)
    },

    /** Tooltip beside the newest answer. */
    async tipAnswer(text, options = {}) {
      // Below a short answer; beside a long one (decided in the overlay).
      await demo.tip(demo.answer(), text, { ms: 6500, ...options })
    },

    /**
     * Full-screen title card; `showLogo: false` leaves room for a diagram. `keep: true` (the
     * closing card) leaves it up until the recording ends, so the video does not end on the
     * app page behind it.
     */
    async card(title, lines, ms = 5000, { showLogo = true, keep = false } = {}) {
      if (!record) return
      await ready()
      await page.evaluate((args) => window.__demoCard(args), { logo, title, lines, showLogo })
      await page.waitForTimeout(ms)
      if (!keep) await page.evaluate(() => window.__demoCardClear())
    },

    /** Tooltip under `locator` (else `fallback`, else centred). */
    async tip(locator, text, { ms = 5200, fallback, side } = {}) {
      step += 1
      if (!record) return
      const box = await boxOf([locator, fallback])
      await ready()
      await page.evaluate((args) => window.__demoTip(args), {
        box, text, step, total: totalSteps, side,
      })
      log(`tooltip ${step}/${totalSteps}${box ? "" : " (centred)"}: ${text.replace(/<[^>]+>/g, "")}`)
      await page.waitForTimeout(ms)
      await page.evaluate(() => window.__demoClear())
    },

    /** Runs `wait`; if it took long, that stretch is cut out of the video afterwards. */
    async fastForward(wait, { keepStart = 2.5, keepEnd = 1.5 } = {}) {
      const start = vt()
      try {
        return await wait()
      } finally {
        const end = vt()
        if (end - start > CUT_AFTER) cuts.push([start + keepStart, end - keepEnd])
      }
    },

    /**
     * Rings `locator` with a short caption (`text` may be empty: ring only) for `ms`, so the
     * viewer sees what is about to be used before it changes.
     */
    async hint(locator, text, { ms = 2200 } = {}) {
      if (!record) return
      const box = await boxOf([locator], { last: false })
      if (!box) return
      await ready()
      await page.evaluate((args) => window.__demoHint(args), { box, text })
      if (text) log(`hint: ${text.replace(/<[^>]+>/g, "")}`)
      await page.waitForTimeout(ms)
      await page.evaluate(() => window.__demoClear())
    },

    /**
     * Types `text` into `input` at reading speed, after an optional caption. Typing Vietnamese
     * key by key can drop characters in some controlled inputs: the value is checked and
     * filled in one go if it came out different.
     */
    async type(input, text, caption, { delay = 60 } = {}) {
      if (caption) await demo.hint(input, caption)
      await input.click()
      await input.fill("")
      if (record) {
        await input.pressSequentially(text, { delay })
        if ((await input.inputValue().catch(() => text)) !== text) await input.fill(text)
      } else {
        await input.fill(text)
      }
      await pause(700)
    },

    /** Opens a shadcn select, lets the options show, then picks the one matching `name`. */
    async choose(trigger, name, caption) {
      if (caption) await demo.hint(trigger, caption)
      await trigger.click()
      await pause(1000)
      const option = page.getByRole("option", { name }).first()
      await option.hover().catch(() => {})
      await demo.hint(option, "", { ms: 900 })
      await option.click()
      await pause(900)
      // Radix selects sometimes swallow the first click: fall back to the retrying pick.
      if (typeof name === "string" && !(await trigger.innerText()).includes(name)) {
        await demo.select(trigger, name)
      }
    },

    /** Clicks `locator` after an optional caption. */
    async press(locator, caption, { ms = 2200, ...options } = {}) {
      // "" rings the element without a caption.
      if (caption != null) await demo.hint(locator, caption, { ms: caption ? ms : 900 })
      await locator.click(options)
      await pause(900)
    },

    /**
     * Opens a page through the sidebar link `label` (shown and clicked, so the viewer sees
     * where it is), else by URL; `pathname` is the page's path.
     */
    async go(label, pathname, caption) {
      const link = page.getByRole("link", { name: label, exact: true }).filter({ visible: true })
      if (await link.count()) {
        await demo.press(link.first(), caption ?? `Mở mục <b>${label}</b>`)
        await page.waitForURL((url) => url.pathname.startsWith(pathname), { timeout: 20_000 })
          .catch(() => page.goto(`${BASE}${pathname}`))
      } else {
        await page.goto(`${BASE}${pathname}`)
      }
      await page.waitForLoadState("networkidle").catch(() => {})
      await pause(1200)
    },

    /**
     * Waits until the answer is complete. A request the usage limit blocks never shows the
     * "stop" button: it returns as soon as that notice appears (25/11/2026: 80 s of a still
     * screen waiting for a button that never came).
     */
    async waitForAnswer({ blockedBefore } = {}) {
      const stop = page.getByRole("button", { name: "Dừng tạo câu trả lời" }).first()
      const blocked = page.getByText(/Bạn đã dùng hết hạn mức/)
      const before = blockedBefore ?? (await blocked.count())
      let wasBlocked = false
      await demo.fastForward(async () => {
        const deadline = Date.now() + 240_000
        let started = false
        while (Date.now() < deadline) {
          if ((await blocked.count()) > before) {
            wasBlocked = true
            return
          }
          const running = await stop.isVisible().catch(() => false)
          if (running) started = true
          if (!running && (started || Date.now() > deadline - 220_000)) break
          await page.waitForTimeout(300)
        }
        await demo.tour("chat-reply-actions").last()
          .waitFor({ state: "visible", timeout: 30_000 }).catch(() => {})
      })
      await page.waitForTimeout(wasBlocked ? 800 : 1800)
      return { blocked: wasBlocked }
    },

    /** Types `text` into `input` (default: the chat composer) and sends it. */
    async ask(text, { input, wait = true } = {}) {
      const box = input ?? demo.composer()
      const interrupted = page.getByText(/Câu trả lời bị gián đoạn/)
      const interruptedBefore = await interrupted.count()
      const blockedBefore = await page.getByText(/Bạn đã dùng hết hạn mức/).count()
      await box.click()
      if (record) await box.pressSequentially(text, { delay: 45 })
      else await box.fill(text)
      await page.waitForTimeout(400)
      await box.press("Enter")
      log(`asked: ${text}`)
      if (!wait) return
      const { blocked } = await demo.waitForAnswer({ blockedBefore })
      if (blocked) {
        log("answer: (blocked by the usage limit)")
        return
      }
      const answer = await demo.answer().innerText().catch(() => "")
      log(`answer: ${answer.slice(0, 300).replace(/\s+/g, " ")}`)
      if ((await interrupted.count()) > interruptedBefore) {
        failures += 1
        log("!!! the answer was interrupted (temporary agent error) - re-record this video")
      }
    },

    /** Picks `name` in a shadcn/Radix select, retrying until the trigger shows it. */
    async select(trigger, name) {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        await trigger.click()
        await page.waitForTimeout(500)
        const option = page.getByRole("option", { name, exact: true })
        if (await option.isVisible().catch(() => false)) await option.click()
        await page.waitForTimeout(500)
        if ((await trigger.innerText()).includes(name)) return
        await page.keyboard.press("Escape").catch(() => {})
      }
      throw new Error(`could not select "${name}"`)
    },

    async newChat() {
      await page.goto(`${BASE}/chat`)
      await demo.composer().waitFor({ timeout: 20_000 })
      await page.waitForTimeout(800)
    },

    async login(key, { tipOnCode } = {}) {
      const [code, password] = ACCOUNTS[key]
      await page.goto(`${BASE}/login`)
      await page.locator("#code").waitFor()
      await page.waitForTimeout(600)
      if (tipOnCode) await demo.tip(page.locator("#code"), tipOnCode)
      await page.locator("#code").pressSequentially(code, { delay: 70 })
      await page.locator("#password").pressSequentially(password, { delay: 70 })
      await page.getByRole("button", { name: "Đăng nhập", exact: true }).click()
      await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 })
      await page.waitForTimeout(1200)
      log(`logged in as ${code} -> ${page.url()}`)
    },

    async logout(key) {
      try {
        // The chat sidebar's account menu is a button with the user's name (no aria-label);
        // other pages have the header's "Tài khoản" button.
        // Accounts created during the video are not in `profiles` yet.
        profiles[key] ??= await profileOf(ACCOUNTS[key]).catch(() => undefined)
        const sidebar = page.locator('button[aria-haspopup="menu"]', {
          hasText: profiles[key]?.fullName ?? "@@none@@",
        })
        const trigger = (await sidebar.count())
          ? sidebar
          : page.getByRole("button", { name: "Tài khoản" })
        await trigger.filter({ visible: true }).first().click({ timeout: 5000 })
        await page.getByRole("menuitem", { name: "Đăng xuất" }).click({ timeout: 5000 })
        await page.waitForURL(`${BASE}/`, { timeout: 15_000 })
      } catch {
        log("logout via the menu failed - clearing the session instead")
        await context.clearCookies()
        await page.evaluate(() => {
          const keep = window.localStorage.getItem("unisage_product_tour_seen")
          window.localStorage.clear()
          if (keep) window.localStorage.setItem("unisage_product_tour_seen", keep)
        })
        await page.goto(`${BASE}/`)
      }
      await page.waitForTimeout(800)
    },

    async scene(label, body) {
      log(`=== ${label}`)
      try {
        await body()
      } catch (error) {
        failures += 1
        log(`!!! ${label} failed: ${error.message.split("\n")[0]}`)
        await page
          .screenshot({ path: path.join(outDir, `${name}-loi-${label.split(":")[0]}.png`) })
          .catch(() => {})
      }
    },
  }

  try {
    await run(demo)
  } finally {
    const video = page.video()
    await context.close()
    if (video) {
      const target = path.join(outDir, `${name}.webm`)
      await video.saveAs(target)
      await video.delete()
      if (cuts.length && process.env.CUT_WAITS !== "0") {
        const raw = path.join(outDir, `${name}.raw.webm`)
        const cutsFile = path.join(outDir, `${name}.cuts.json`)
        fs.renameSync(target, raw)
        fs.writeFileSync(cutsFile, JSON.stringify(cuts))
        const script = new URL("./cut_waits.py", import.meta.url).pathname
        log(execFileSync("python3", [script, raw, target, cutsFile]).toString().trim())
        fs.rmSync(raw)
        fs.rmSync(cutsFile)
      }
      log(`video: ${target} - ${step}/${totalSteps} tooltips, ${failures} failed scene(s)`)
    } else {
      log(`${name}: done without recording, ${failures} failed scene(s)`)
    }
    await browser.close()
  }
}
