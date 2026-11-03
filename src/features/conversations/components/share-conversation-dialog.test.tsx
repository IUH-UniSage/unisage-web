import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen } from "@testing-library/react"
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

import { ShareConversationDialog } from "@/features/conversations/components/share-conversation-dialog"
import { apiError, apiOk, SHARE_TOKEN } from "@/test/fixtures/shares"

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }))
vi.mock("sonner", () => ({ toast }))

const CONVERSATION = {
  id: "0f8fad5b-d9cb-469f-a165-70867728950e",
  title: "Hỏi về học phí",
}

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <ShareConversationDialog
        conversation={CONVERSATION}
        onOpenChange={() => {}}
      />
    </QueryClientProvider>
  )
  return userEvent.setup()
}

describe("ShareConversationDialog", () => {
  it("creates a link, shows it and copies it", async () => {
    let body: unknown
    server.use(
      http.post("*/shares", async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(
          apiOk({
            createdAt: "2026-11-02T03:00:00Z",
            id: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
            messageCount: 4,
            title: CONVERSATION.title,
            token: SHARE_TOKEN,
          }),
          { status: 201 }
        )
      })
    )
    const user = renderDialog()
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined)

    expect(
      screen.getByText(
        "Người nhận cần đăng nhập. Tin nhắn bạn gửi sau khi tạo link sẽ không được chia sẻ."
      )
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Tạo liên kết" }))

    const link = `${window.location.origin}/share/${SHARE_TOKEN}`
    expect(await screen.findByLabelText("Liên kết chia sẻ")).toHaveValue(link)
    expect(body).toEqual({ conversationId: CONVERSATION.id })

    await user.click(screen.getByRole("button", { name: "Sao chép" }))
    expect(writeText).toHaveBeenCalledWith(link)
    expect(toast.success).toHaveBeenCalledWith("Đã sao chép liên kết")
  })

  it("toasts a Vietnamese message for an empty conversation (2802)", async () => {
    server.use(
      http.post("*/shares", () =>
        HttpResponse.json(apiError(2802), { status: 400 })
      )
    )
    const user = renderDialog()

    await user.click(screen.getByRole("button", { name: "Tạo liên kết" }))

    await vi.waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Đoạn chat chưa có câu trả lời nào để chia sẻ."
      )
    )
    expect(screen.queryByText(/RAW BACKEND MESSAGE/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Liên kết chia sẻ")).not.toBeInTheDocument()
  })

  it("toasts the generic message for an unknown error", async () => {
    server.use(
      http.post("*/shares", () =>
        HttpResponse.json(apiError(9999), { status: 500 })
      )
    )
    const user = renderDialog()

    await user.click(screen.getByRole("button", { name: "Tạo liên kết" }))

    await vi.waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Không thực hiện được, vui lòng thử lại sau."
      )
    )
  })
})
