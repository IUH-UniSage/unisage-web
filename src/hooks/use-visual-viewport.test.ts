import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useVisualViewport } from "@/hooks/use-visual-viewport"

class FakeVisualViewport extends EventTarget {
  height = 800
  offsetTop = 0
  width = 390

  set(
    values: Partial<Pick<FakeVisualViewport, "height" | "offsetTop" | "width">>
  ) {
    Object.assign(this, values)
    this.dispatchEvent(new Event("resize"))
  }
}

const root = document.documentElement

describe("useVisualViewport", () => {
  let viewport: FakeVisualViewport

  beforeEach(() => {
    viewport = new FakeVisualViewport()
    vi.stubGlobal("visualViewport", viewport)
    // Run the rAF-batched update at once.
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0)
      return 0 // already ran: no frame left pending
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("sizes the shell to the visible screen and flags the keyboard", () => {
    const { unmount } = renderHook(() => useVisualViewport())
    expect(root.style.getPropertyValue("--app-height")).toBe("800px")
    expect(root.dataset.keyboard).toBeUndefined()

    // iOS: the keyboard takes 340px and Safari scrolls the page up by 120px.
    viewport.set({ height: 460, offsetTop: 120 })
    expect(root.style.getPropertyValue("--app-height")).toBe("460px")
    expect(root.style.getPropertyValue("--app-top")).toBe("120px")
    expect(root.dataset.keyboard).toBe("open")

    viewport.set({ height: 800, offsetTop: 0 })
    expect(root.dataset.keyboard).toBeUndefined()

    unmount()
    expect(root.style.getPropertyValue("--app-height")).toBe("")
    expect(root.dataset.keyboard).toBeUndefined()
  })

  it("does not take the browser toolbar collapsing for the keyboard", () => {
    renderHook(() => useVisualViewport())
    viewport.set({ height: 860 })
    viewport.set({ height: 800 })
    expect(root.dataset.keyboard).toBeUndefined()
  })

  it("starts over after a rotation", () => {
    renderHook(() => useVisualViewport())
    viewport.set({ height: 360, width: 800 })
    expect(root.dataset.keyboard).toBeUndefined()
  })
})
