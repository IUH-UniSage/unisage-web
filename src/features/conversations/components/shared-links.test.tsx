import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
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

import type { Share } from "@/features/conversations/schemas/share-schemas"
import { SharedLinksPage } from "@/pages/user/shared-links-page"
import {
  apiError,
  apiOk,
  buildShare,
  ORIGINAL_CONVERSATION_ID,
  SHARE_TOKEN,
} from "@/test/fixtures/shares"

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }))
vi.mock("sonner", () => ({ toast }))

const SECOND = buildShare({
  conversationId: "a3bb189e-8bf9-3888-9912-ace4e6543002",
  id: "16fd2706-8baf-433b-82eb-8c7fada847da",
  messageCount: 2,
  title: "Lịch thi cuối kỳ",
  token: "c2Vjb25kLXRva2Vu",
})

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

function page(data: Share[]) {
  return apiOk({
    data,
    limit: 10,
    page: 1,
    totalItems: data.length,
    totalPages: data.length ? 1 : 0,
  })
}

// Serves GET /shares from a mutable list, so revoking shows on the refetch.
function serveShares(initial: Share[]) {
  let shares = [...initial]
  server.use(
    http.get("*/shares", () => HttpResponse.json(page(shares))),
    http.delete("*/shares/:id", ({ params }) => {
      shares = shares.filter((share) => share.id !== params.id)
      return HttpResponse.json(apiOk(null))
    }),
    http.delete("*/shares", () => {
      const revoked = shares.length
      shares = []
      return HttpResponse.json(apiOk(revoked))
    })
  )
}

function ChatStub() {
  const { conversationId } = useParams()
  return <h1>Trang chat {conversationId}</h1>
}

function renderPage() {
  // Mirrors lib/query-client: `meta.invalidatesQuery` refetches after a mutation.
  const queryClient: QueryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    mutationCache: new MutationCache({
      onSettled: (_data, _error, _variables, _context, mutation) => {
        if (mutation.meta?.invalidatesQuery) {
          void queryClient.invalidateQueries({
            queryKey: mutation.meta.invalidatesQuery,
          })
        }
      },
    }),
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/shared-links"]}>
        <Routes>
          <Route element={<SharedLinksPage />} path="/shared-links" />
          <Route element={<ChatStub />} path="/chat/:conversationId" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
  return userEvent.setup()
}

describe("SharedLinksPage", () => {
  it("lists my links with their date and message count", async () => {
    serveShares([buildShare(), SECOND])
    renderPage()

    const row = (
      await screen.findByRole("link", { name: "Hỏi về học phí" })
    ).closest("tr") as HTMLElement
    expect(within(row).getByText("4")).toBeInTheDocument()
    expect(screen.getByText("2 liên kết")).toBeInTheDocument()
  })

  it("shows the empty state", async () => {
    serveShares([])
    renderPage()

    expect(
      await screen.findByText("Bạn chưa chia sẻ liên kết nào")
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Thu hồi tất cả" })
    ).toBeDisabled()
  })

  it("opens the original conversation from the title", async () => {
    serveShares([buildShare()])
    const user = renderPage()

    await user.click(
      await screen.findByRole("link", { name: "Hỏi về học phí" })
    )

    expect(
      await screen.findByRole("heading", {
        name: `Trang chat ${ORIGINAL_CONVERSATION_ID}`,
      })
    ).toBeInTheDocument()
  })

  it("copies a link", async () => {
    serveShares([buildShare()])
    const user = renderPage()
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined)

    await user.click(
      await screen.findByRole("button", {
        name: "Sao chép liên kết Hỏi về học phí",
      })
    )

    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/share/${SHARE_TOKEN}`
    )
    expect(toast.success).toHaveBeenCalledWith("Đã sao chép liên kết")
  })

  it("revokes one link after confirmation", async () => {
    serveShares([buildShare(), SECOND])
    const user = renderPage()

    await user.click(
      await screen.findByRole("button", {
        name: "Thu hồi liên kết Hỏi về học phí",
      })
    )
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Thu hồi" }))

    await vi.waitFor(() =>
      expect(
        screen.queryByRole("link", { name: "Hỏi về học phí" })
      ).not.toBeInTheDocument()
    )
    expect(
      screen.getByRole("link", { name: "Lịch thi cuối kỳ" })
    ).toBeInTheDocument()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("revokes all links after confirmation", async () => {
    serveShares([buildShare(), SECOND])
    const user = renderPage()

    await screen.findByRole("link", { name: "Hỏi về học phí" })
    await user.click(screen.getByRole("button", { name: "Thu hồi tất cả" }))
    const dialog = await screen.findByRole("dialog")
    expect(
      within(dialog).getByRole("heading", { name: "Thu hồi tất cả liên kết?" })
    ).toBeInTheDocument()
    await user.click(
      within(dialog).getByRole("button", { name: "Thu hồi tất cả" })
    )

    expect(
      await screen.findByText("Bạn chưa chia sẻ liên kết nào")
    ).toBeInTheDocument()
  })

  it("toasts in Vietnamese when revoking fails", async () => {
    serveShares([buildShare()])
    server.use(
      http.delete("*/shares/:id", () =>
        HttpResponse.json(apiError(9999), { status: 500 })
      )
    )
    const user = renderPage()

    await user.click(
      await screen.findByRole("button", {
        name: "Thu hồi liên kết Hỏi về học phí",
      })
    )
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Thu hồi" }))

    await vi.waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Không thực hiện được, vui lòng thử lại sau."
      )
    )
    expect(screen.queryByText(/RAW BACKEND MESSAGE/)).not.toBeInTheDocument()
  })
})
