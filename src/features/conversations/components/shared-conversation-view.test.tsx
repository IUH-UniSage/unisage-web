import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { HttpResponse, http } from "msw"
import { setupServer } from "msw/node"
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom"

import { chatKeys } from "@/features/chat/queries/keys"
import { SharedConversationPage } from "@/pages/user/shared-conversation-page"
import {
  apiError,
  apiOk,
  buildSharedConversation,
  COPY_CONVERSATION_ID,
  ORIGINAL_CONVERSATION_ID,
  SHARE_TOKEN,
} from "@/test/fixtures/shares"

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }))
vi.mock("sonner", () => ({ toast }))

const server = setupServer()
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" })
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})
afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

function ChatStub() {
  const { conversationId } = useParams()
  return <h1>Trang chat {conversationId ?? "mới"}</h1>
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/share/${SHARE_TOKEN}`]}>
        <Routes>
          <Route element={<SharedConversationPage />} path="/share/:token" />
          <Route element={<ChatStub />} path="/chat/:conversationId?" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { queryClient, user: userEvent.setup() }
}

function serveSnapshot(body: object, status = 200) {
  server.use(
    http.get(`*/shares/view/${SHARE_TOKEN}`, () =>
      HttpResponse.json(body, { status })
    )
  )
}

describe("SharedConversationPage", () => {
  it("renders the snapshot read-only", async () => {
    serveSnapshot(apiOk(buildSharedConversation()))
    renderPage()

    expect(
      await screen.findByRole("heading", { name: "Hỏi về học phí" })
    ).toBeInTheDocument()
    expect(screen.getByText(/Hội thoại được chia sẻ · /)).toBeInTheDocument()
    expect(
      screen.getByText("Học phí học kỳ này là bao nhiêu?")
    ).toBeInTheDocument()
    // No composer, no report/feedback buttons.
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Báo cáo câu trả lời này" })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Tiếp tục cuộc trò chuyện" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Mở hội thoại gốc" })
    ).not.toBeInTheDocument()
  })

  it("continues into the viewer's own copy and refreshes the chat list", async () => {
    serveSnapshot(apiOk(buildSharedConversation()))
    server.use(
      http.post(`*/shares/view/${SHARE_TOKEN}/continue`, () =>
        HttpResponse.json(apiOk({ conversationId: COPY_CONVERSATION_ID }))
      )
    )
    const { queryClient, user } = renderPage()

    await user.click(
      await screen.findByRole("button", { name: "Tiếp tục cuộc trò chuyện" })
    )

    expect(
      await screen.findByRole("heading", {
        name: `Trang chat ${COPY_CONVERSATION_ID}`,
      })
    ).toBeInTheDocument()
    // The global MutationCache (lib/query-client) invalidates `meta` keys; the
    // test client has none, so check the mutation declares the chat list.
    const mutation = queryClient.getMutationCache().getAll()[0]
    expect(mutation?.meta?.invalidatesQuery).toEqual([
      ...chatKeys.all,
      "conversations",
    ])
  })

  it("toasts in Vietnamese when continuing fails", async () => {
    serveSnapshot(apiOk(buildSharedConversation()))
    server.use(
      http.post(`*/shares/view/${SHARE_TOKEN}/continue`, () =>
        HttpResponse.json(apiError(2801), { status: 404 })
      )
    )
    const { user } = renderPage()

    await user.click(
      await screen.findByRole("button", { name: "Tiếp tục cuộc trò chuyện" })
    )

    await vi.waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Liên kết không tồn tại hoặc đã bị thu hồi."
      )
    )
  })

  it("offers the owner the original conversation instead of a copy", async () => {
    serveSnapshot(
      apiOk(
        buildSharedConversation({
          conversationId: ORIGINAL_CONVERSATION_ID,
          isOwner: true,
        })
      )
    )
    const { user } = renderPage()

    await user.click(
      await screen.findByRole("button", { name: "Mở hội thoại gốc" })
    )

    expect(
      screen.queryByRole("button", { name: "Tiếp tục cuộc trò chuyện" })
    ).not.toBeInTheDocument()
    expect(
      await screen.findByRole("heading", {
        name: `Trang chat ${ORIGINAL_CONVERSATION_ID}`,
      })
    ).toBeInTheDocument()
  })

  it("shows a friendly empty state for a missing or revoked link", async () => {
    serveSnapshot(apiError(2801), 404)
    const { user } = renderPage()

    expect(
      await screen.findByRole("heading", {
        name: "Liên kết không tồn tại hoặc đã bị thu hồi",
      })
    ).toBeInTheDocument()
    expect(screen.queryByText(/RAW BACKEND MESSAGE/)).not.toBeInTheDocument()
    expect(toast.error).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole("button", { name: "Về trang trò chuyện" })
    )
    expect(
      await screen.findByRole("heading", { name: "Trang chat mới" })
    ).toBeInTheDocument()
  })

  it("opens a citation with the viewer's own access check", async () => {
    serveSnapshot(apiOk(buildSharedConversation()))
    server.use(
      http.get("*/documents/:documentId/citation", () =>
        HttpResponse.json(apiError(2312), { status: 403 })
      )
    )
    const { user } = renderPage()

    await user.click(
      await screen.findByRole("button", { name: /Quy định học phí 2026/ })
    )

    const drawer = await screen.findByRole("dialog")
    expect(
      await within(drawer).findByText("Bạn không có quyền xem tài liệu này.")
    ).toBeInTheDocument()
    expect(screen.queryByText(/RAW BACKEND MESSAGE/)).not.toBeInTheDocument()
  })
})
