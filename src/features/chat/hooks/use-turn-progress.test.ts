import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  useTurnProgress,
  WEB_PAGE_MIN_VISIBLE_MS,
} from "@/features/chat/hooks/use-turn-progress"

const PAGE_A = { stage: "web_searching", url: "https://pdt.iuh.edu.vn/a" }
const PAGE_B = { stage: "web_searching", url: "https://pdt.iuh.edu.vn/b" }
const PAGE_C = { stage: "web_searching", url: "https://pdt.iuh.edu.vn/c" }

describe("useTurnProgress", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-14T05:00:00Z"))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("starts the clock with no status and shows each stage at once", () => {
    const { result } = renderHook(() => useTurnProgress())

    act(() => result.current.start("m1"))
    expect(result.current.progress).toEqual({
      messageId: "m1",
      startedAt: Date.now(),
      status: null,
    })

    act(() => result.current.push({ stage: "analyzing" }))
    act(() => result.current.push({ stage: "retrieving" }))
    expect(result.current.progress?.status).toEqual({ stage: "retrieving" })
  })

  it("shows web pages one after the other", () => {
    const { result } = renderHook(() => useTurnProgress())
    act(() => result.current.start("m1"))

    act(() => {
      result.current.push({ stage: "web_searching" })
      result.current.push(PAGE_A)
      result.current.push(PAGE_B)
      result.current.push(PAGE_C)
    })
    expect(result.current.progress?.status).toEqual(PAGE_A)

    act(() => vi.advanceTimersByTime(WEB_PAGE_MIN_VISIBLE_MS))
    expect(result.current.progress?.status).toEqual(PAGE_B)
    act(() => vi.advanceTimersByTime(WEB_PAGE_MIN_VISIBLE_MS))
    expect(result.current.progress?.status).toEqual(PAGE_C)
  })

  it("a page arriving soon after another waits for its turn", () => {
    const { result } = renderHook(() => useTurnProgress())
    act(() => result.current.start("m1"))

    act(() => result.current.push(PAGE_A))
    act(() => vi.advanceTimersByTime(300))
    act(() => result.current.push(PAGE_B))
    expect(result.current.progress?.status).toEqual(PAGE_A)

    act(() => vi.advanceTimersByTime(WEB_PAGE_MIN_VISIBLE_MS - 300))
    expect(result.current.progress?.status).toEqual(PAGE_B)
  })

  it("a new stage cuts the pages still waiting", () => {
    const { result } = renderHook(() => useTurnProgress())
    act(() => result.current.start("m1"))

    act(() => {
      result.current.push(PAGE_A)
      result.current.push(PAGE_B)
      result.current.push({ stage: "generating" })
    })
    act(() => vi.advanceTimersByTime(5 * WEB_PAGE_MIN_VISIBLE_MS))

    expect(result.current.progress?.status).toEqual({ stage: "generating" })
  })

  it("stop clears the turn and ignores later statuses", () => {
    const { result } = renderHook(() => useTurnProgress())
    act(() => result.current.start("m1"))
    act(() => result.current.stop())
    act(() => result.current.push({ stage: "generating" }))

    expect(result.current.progress).toBeNull()
  })
})
