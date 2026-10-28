import { expect, test, type Page } from "@playwright/test"

import { seeToursExcept } from "./support/auth"
import { browseAsGuest, mockGuestChat } from "./support/chat"

declare global {
  interface Window {
    /** Test hook: what the fake recognizer "hears" next. */
    __speak: (text: string, isFinal: boolean) => void
  }
}

// Headless Chromium has neither a microphone nor Google's speech service:
// the mic is a quiet oscillator (so the waveform moves) and SpeechRecognition
// a fake driven by `window.__speak`.
async function fakeSpeechRecognition(page: Page) {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      gain.gain.value = 0.6
      const dest = ctx.createMediaStreamDestination()
      osc.connect(gain).connect(dest)
      osc.start()
      return dest.stream
    }

    type Result = { isFinal: boolean; 0: { transcript: string } }
    class FakeRecognition extends EventTarget {
      continuous = false
      interimResults = false
      lang = ""
      maxAlternatives = 1
      onstart: ((ev: Event) => void) | null = null
      onend: ((ev: Event) => void) | null = null
      onresult:
        ((ev: { resultIndex: number; results: Result[] }) => void) | null = null
      onerror: ((ev: Event) => void) | null = null
      private results: Result[] = []

      start() {
        window.__speak = (text, isFinal) => {
          const last = this.results.at(-1)
          const index =
            last && !last.isFinal
              ? this.results.length - 1
              : this.results.length
          this.results[index] = { isFinal, 0: { transcript: text } }
          this.onresult?.({ resultIndex: index, results: this.results })
        }
        setTimeout(() => this.onstart?.(new Event("start")), 0)
      }
      stop() {
        setTimeout(() => this.onend?.(new Event("end")), 0)
      }
      abort() {
        setTimeout(() => this.onend?.(new Event("end")), 0)
      }
    }
    for (const name of ["SpeechRecognition", "webkitSpeechRecognition"]) {
      Object.defineProperty(window, name, {
        configurable: true,
        value: FakeRecognition,
      })
    }
  })
}

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ height: 812, width: 375 })
  }
  await browseAsGuest(page)
  await mockGuestChat(page)
  await seeToursExcept(page, [])
  await fakeSpeechRecognition(page)
})

test("dictates into the composer with a live waveform", async ({
  page,
}, testInfo) => {
  await page.goto("/chat")
  const textbox = page.getByRole("textbox", { name: "Tin nhắn gửi UniSage" })
  await textbox.fill("Cho em hỏi")

  await page.getByRole("button", { name: "Nhập bằng giọng nói" }).click()
  const confirm = page.getByRole("button", {
    name: "Xong, dùng nội dung vừa nói",
  })
  await expect(confirm).toBeVisible()
  await expect(page.getByRole("button", { name: "Gửi tin nhắn" })).toBeHidden()

  // Words in progress show up live, after what was already typed.
  await page.evaluate(() => window.__speak("học phí ngành", false))
  await expect(textbox).toHaveValue(/^Cho em hỏi học phí ngành\.{0,3}$/)
  await page.evaluate(() =>
    window.__speak("học phí ngành công nghệ thông tin", true)
  )
  await expect(textbox).toHaveValue(
    /^Cho em hỏi học phí ngành công nghệ thông tin\.{0,3}$/
  )

  const [viewport, content] = await page.evaluate(() => [
    document.documentElement.clientWidth,
    document.documentElement.scrollWidth,
  ])
  expect(content).toBe(viewport)
  await page.screenshot({
    path: testInfo.outputPath(
      `chat-voice-listening-${testInfo.project.name}.png`
    ),
  })

  await confirm.click()
  await expect(textbox).toHaveValue(
    "Cho em hỏi học phí ngành công nghệ thông tin"
  )
  await expect(textbox).toBeEditable()
  await expect(page.getByRole("button", { name: "Gửi tin nhắn" })).toBeEnabled()
})

test("cancelling keeps the text typed before dictation", async ({ page }) => {
  await page.goto("/chat")
  const textbox = page.getByRole("textbox", { name: "Tin nhắn gửi UniSage" })
  await textbox.fill("Cho em hỏi")

  await page.getByRole("button", { name: "Nhập bằng giọng nói" }).click()
  await page.evaluate(() => window.__speak("không cần nữa", true))
  await page.getByRole("button", { name: "Hủy nhập bằng giọng nói" }).click()

  await expect(textbox).toHaveValue("Cho em hỏi")
  await expect(
    page.getByRole("button", { name: "Nhập bằng giọng nói" })
  ).toBeVisible()
})
