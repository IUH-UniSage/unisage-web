import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  ChatStreamHttpError,
  useChatStream,
} from "@/features/chat/hooks/use-chat-stream"
import { CONTRACT_PANEL } from "@/test/fixtures/clarification"

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

  it("forwards event: clarification with the parsed panel, then finishes", async () => {
    const events = [
      'event: token\ndata: "Mình cần thêm vài thông tin."\n\n',
      `event: clarification\ndata: ${JSON.stringify(CONTRACT_PANEL)}\n\n`,
      "event: done\ndata: {}\n\n",
    ]
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sseResponse(events)))
    const { result } = renderHook(() => useChatStream())

    const onClarification = vi.fn()
    const onDone = vi.fn()
    await result.current.stream(
      { conversationId: "conv-1", message: "GPA của em?" },
      { onClarification, onDone }
    )

    expect(onClarification).toHaveBeenCalledWith(CONTRACT_PANEL)
    expect(onDone).toHaveBeenCalledWith("Mình cần thêm vài thông tin.")
  })

  it("drops a clarification panel that breaks the strict schema", async () => {
    const events = [
      `event: clarification\ndata: ${JSON.stringify({ ...CONTRACT_PANEL, origin: "x" })}\n\n`,
      "event: done\ndata: {}\n\n",
    ]
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sseResponse(events)))
    const { result } = renderHook(() => useChatStream())

    const onClarification = vi.fn()
    await result.current.stream(
      { conversationId: "conv-1", message: "hi" },
      { onClarification }
    )

    expect(onClarification).not.toHaveBeenCalled()
  })

  it("sends a cancel body and forwards event: clarification_closed", async () => {
    const events = [
      'event: clarification_closed\ndata: {"panel_id":"p-1","status":"cancelled"}\n\n',
      "event: done\ndata: {}\n\n",
    ]
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(events))
    vi.stubGlobal("fetch", fetchMock)
    const { result } = renderHook(() => useChatStream())

    const onClarificationClosed = vi.fn()
    const onDone = vi.fn()
    await result.current.stream(
      {
        clarification: { action: "cancel", panel_id: "p-1" },
        conversationId: "conv-1",
      },
      { onClarificationClosed, onDone }
    )

    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(JSON.parse(init.body as string)).toEqual({
      clarification: { action: "cancel", panel_id: "p-1" },
      conversation_id: "conv-1",
    })
    expect(onClarificationClosed).toHaveBeenCalledWith({
      panel_id: "p-1",
      status: "cancelled",
    })
    expect(onDone).toHaveBeenCalledWith("")
  })

  it("sends a submit body with answers and no message field", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(sseResponse(["event: done\ndata: {}\n\n"]))
    vi.stubGlobal("fetch", fetchMock)
    const { result } = renderHook(() => useChatStream())

    const answers = [{ number: "6.5", question_id: "q2" }]
    await result.current.stream(
      {
        clarification: { action: "submit", answers, panel_id: "p-1" },
        conversationId: "conv-1",
      },
      {}
    )

    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(JSON.parse(init.body as string)).toEqual({
      clarification: { action: "submit", answers, panel_id: "p-1" },
      conversation_id: "conv-1",
    })
  })

  it("ignores unknown events", async () => {
    const events = [
      'event: something_new\ndata: {"x":1}\n\n',
      'event: token\ndata: "ok"\n\n',
      "event: done\ndata: {}\n\n",
    ]
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sseResponse(events)))
    const { result } = renderHook(() => useChatStream())

    const onDone = vi.fn()
    const onError = vi.fn()
    await result.current.stream(
      { conversationId: "conv-1", message: "hi" },
      { onDone, onError }
    )

    expect(onDone).toHaveBeenCalledWith("ok")
    expect(onError).not.toHaveBeenCalled()
  })

  it("surfaces a 4010 response with its per-question error map", async () => {
    const body = {
      code: 4010,
      errors: { q2: "Giá trị phải từ 0 đến 10" },
      message: "Câu trả lời chưa hợp lệ",
    }
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(body), { status: 400 }))
    )
    const { result } = renderHook(() => useChatStream())

    const onError = vi.fn()
    await result.current.stream(
      {
        clarification: { action: "submit", answers: [], panel_id: "p-1" },
        conversationId: "conv-1",
      },
      { onError }
    )

    const error = onError.mock.calls[0][0] as ChatStreamHttpError
    expect(error).toBeInstanceOf(ChatStreamHttpError)
    expect(error.status).toBe(400)
    expect(error.code).toBe(4010)
    expect(error.message).toBe("Câu trả lời chưa hợp lệ")
    expect(error.errors).toEqual(body.errors)
  })
})
