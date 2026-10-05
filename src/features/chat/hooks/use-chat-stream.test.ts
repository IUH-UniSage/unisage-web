import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useChatStream } from "@/features/chat/hooks/use-chat-stream"

/** Builds a `Response` whose body streams `events` (already-formatted SSE
 * frames, e.g. `"event: token\\ndata: \"a\"\\n\\n"`) one chunk at a time -
 * enough to exercise `useChatStream`'s manual `ReadableStream` reader
 * without a real network call. */
function sseResponse(events: string[]): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(event))
      }
      controller.close()
    },
  })
  return new Response(stream, { status: 200 })
}

describe("useChatStream", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("forwards event: error and never calls onDone after it (backend's SSE error contract)", async () => {
    const events = [
      'event: token\ndata: "a"\n\n',
      'event: token\ndata: "b"\n\n',
      'event: error\ndata: {"code":"LLM_STREAM_INTERRUPTED","message":"Đã có lỗi xảy ra.","retryable":true}\n\n',
      "event: done\ndata: {}\n\n",
    ]
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(events))
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useChatStream())

    const onChunk = vi.fn()
    const onDone = vi.fn()
    const onStreamError = vi.fn()

    await result.current.stream(
      { conversationId: "conv-1", message: "hi" },
      { onChunk, onDone, onStreamError }
    )

    expect(onChunk).toHaveBeenCalledTimes(2)
    expect(onStreamError).toHaveBeenCalledTimes(1)
    const [payload, textAtFailure] = onStreamError.mock.calls[0] as [
      { code: string; message: string; retryable: boolean },
      string,
    ]
    expect(payload).toEqual({
      code: "LLM_STREAM_INTERRUPTED",
      message: "Đã có lỗi xảy ra.",
      retryable: true,
    })
    // Text streamed before the failure is handed to the caller, not
    // discarded.
    expect(textAtFailure).toBe("ab")
    // event: done still arrives on the wire, but must never also fire
    // onDone once an error was seen - that would tell the caller the turn
    // succeeded.
    expect(onDone).not.toHaveBeenCalled()
  })

  it("calls onDone (not onStreamError) for a clean stream with no error event", async () => {
    const events = [
      'event: token\ndata: "x"\n\n',
      'event: token\ndata: "y"\n\n',
      "event: done\ndata: {}\n\n",
    ]
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(events))
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useChatStream())

    const onDone = vi.fn()
    const onStreamError = vi.fn()

    await result.current.stream(
      { conversationId: "conv-1", message: "hi" },
      { onDone, onStreamError }
    )

    expect(onDone).toHaveBeenCalledWith("xy")
    expect(onStreamError).not.toHaveBeenCalled()
  })

  it("forwards event: warning and still finishes the turn normally", async () => {
    const events = [
      'event: token\ndata: "x"\n\n',
      'event: warning\ndata: {"code":"WEB_SEARCH_CREDITS_EXHAUSTED","message":"Tavily hết credit"}\n\n',
      "event: done\ndata: {}\n\n",
    ]
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(events))
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useChatStream())

    const onDone = vi.fn()
    const onStreamError = vi.fn()
    const onWarning = vi.fn()

    await result.current.stream(
      { conversationId: "conv-1", message: "hi" },
      { onDone, onStreamError, onWarning }
    )

    expect(onWarning).toHaveBeenCalledWith({
      code: "WEB_SEARCH_CREDITS_EXHAUSTED",
      message: "Tavily hết credit",
    })
    expect(onDone).toHaveBeenCalledWith("x")
    expect(onStreamError).not.toHaveBeenCalled()
  })
})
