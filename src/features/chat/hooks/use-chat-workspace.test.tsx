import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useChatWorkspace } from "@/features/chat/hooks/use-chat-workspace"
import { chatKeys } from "@/features/chat/queries/keys"
import type { Message } from "@/features/chat/schemas/chat-schemas"
import {
  buildMessage,
  CONTRACT_ANSWERS,
  CONTRACT_PANEL,
} from "@/test/fixtures/clarification"

const toast = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}))
vi.mock("sonner", () => ({ toast }))

const CONVERSATION_ID = "4d0f7f4e-8a3b-4c55-9d2e-0c7a3e9b1a11"

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({ session: null }),
}))

const getMessagesByConversation = vi.fn<() => Promise<Message[]>>()

vi.mock("@/features/chat/api/chat-api", () => ({
  chatApi: {
    createConversation: vi.fn().mockResolvedValue({
      createdAt: "2026-10-09T00:00:00.000Z",
      id: "4d0f7f4e-8a3b-4c55-9d2e-0c7a3e9b1a11",
      title: "GPA",
      userId: null,
    }),
    getGuestConversations: vi.fn().mockResolvedValue([]),
    getMessagesByConversation: () => getMessagesByConversation(),
  },
}))

function sseResponse(events: string[]): Response {
  const encoder = new TextEncoder()
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const event of events) controller.enqueue(encoder.encode(event))
        controller.close()
      },
    }),
    { status: 200 }
  )
}

describe("useChatWorkspace clarification", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    // The refetch after `done` never resolves, so the test sees exactly what
    // the stream wrote into the cache.
    getMessagesByConversation.mockReturnValue(new Promise(() => {}))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it("writes an open clarification into the streamed assistant message", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          sseResponse([
            'event: token\ndata: "Mình cần thêm thông tin."\n\n',
            `event: clarification\ndata: ${JSON.stringify(CONTRACT_PANEL)}\n\n`,
            "event: done\ndata: {}\n\n",
          ])
        )
    )
    const { result } = renderHook(() => useChatWorkspace(), { wrapper })

    await act(async () => {
      await result.current.sendMessage("GPA của em?")
    })

    const cached = queryClient.getQueryData<Message[]>(
      chatKeys.messages(CONVERSATION_ID)
    )
    const assistant = cached?.at(-1)
    expect(assistant?.metadata).toEqual({
      clarification: {
        panel: CONTRACT_PANEL,
        schema_version: 1,
        status: "open",
      },
    })
    await waitFor(() =>
      expect(result.current.openPanel?.panel.panel_id).toBe(
        CONTRACT_PANEL.panel_id
      )
    )
  })

  function seedOpenPanel() {
    const assistant = buildMessage({
      content: "Mình cần thêm thông tin.",
      conversationId: CONVERSATION_ID,
      metadata: {
        clarification: {
          panel: CONTRACT_PANEL,
          schema_version: 1,
          status: "open",
        },
      },
    })
    queryClient.setQueryData(chatKeys.messages(CONVERSATION_ID), [assistant])
    const hook = renderHook(() => useChatWorkspace(), { wrapper })
    act(() => hook.result.current.selectConversation(CONVERSATION_ID))
    return hook
  }

  const submission = {
    answers: [{ option_id: "k20", question_id: "q1" }],
    card: CONTRACT_ANSWERS,
    panel: CONTRACT_PANEL,
    summary: "Khoá: K20",
  }

  function httpError(status: number, body: object) {
    return vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(body), { status }))
  }

  it("keeps the panel open with per-question errors on 4010", async () => {
    vi.stubGlobal(
      "fetch",
      httpError(400, {
        code: 4010,
        errors: { q2: "Ngoài khoảng" },
        message: "Câu trả lời chưa hợp lệ",
      })
    )
    const { result } = seedOpenPanel()
    expect(result.current.openPanel).not.toBeNull()

    await act(async () => {
      await result.current.submitClarification(submission)
    })

    expect(result.current.openPanel?.panel.panel_id).toBe(
      CONTRACT_PANEL.panel_id
    )
    expect(result.current.clarificationErrors).toEqual({ q2: "Ngoài khoảng" })
    expect(result.current.messages).toHaveLength(1)
  })

  it("closes the panel and refetches on 4091", async () => {
    vi.stubGlobal("fetch", httpError(409, { code: 4091, message: "Stale" }))
    const { result } = seedOpenPanel()

    await act(async () => {
      await result.current.submitClarification(submission)
    })

    expect(result.current.openPanel).toBeNull()
    expect(toast.error).toHaveBeenCalledWith("Câu hỏi đã được trả lời hoặc huỷ")
  })

  it("adds the optimistic USER message with clarification_answers", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})))
    const { result } = seedOpenPanel()

    act(() => {
      void result.current.submitClarification(submission)
    })

    await waitFor(() => expect(result.current.messages).toHaveLength(3))
    const user = result.current.messages[1]
    expect(user.role).toBe("USER")
    expect(user.content).toBe("Khoá: K20")
    expect(user.metadata).toEqual({ clarification_answers: CONTRACT_ANSWERS })
    expect(result.current.openPanel).toBeNull()
  })

  it("keeps the panel when a cancel gets 503", async () => {
    vi.stubGlobal(
      "fetch",
      httpError(503, {
        code: "BACKEND_JAVA_UNAVAILABLE",
        message: "Unavailable",
      })
    )
    const { result } = seedOpenPanel()

    await act(async () => {
      await result.current.cancelClarification()
    })

    expect(result.current.openPanel).not.toBeNull()
    expect(toast.error).toHaveBeenCalledWith("Chưa huỷ được, thử lại nhé")
  })

  it("closes the panel on clarification_closed", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          sseResponse([
            `event: clarification_closed\ndata: {"panel_id":"${CONTRACT_PANEL.panel_id}","status":"cancelled"}\n\n`,
            "event: done\ndata: {}\n\n",
          ])
        )
    )
    const { result } = seedOpenPanel()

    await act(async () => {
      await result.current.cancelClarification()
    })

    expect(result.current.openPanel).toBeNull()
    expect(result.current.isCancellingClarification).toBe(false)
  })
})
