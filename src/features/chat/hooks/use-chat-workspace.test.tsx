import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useChatWorkspace } from "@/features/chat/hooks/use-chat-workspace"
import { chatKeys } from "@/features/chat/queries/keys"
import type { Message } from "@/features/chat/schemas/chat-schemas"
import { CONTRACT_PANEL } from "@/test/fixtures/clarification"

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
})
