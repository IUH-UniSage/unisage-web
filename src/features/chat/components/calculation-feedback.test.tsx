import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AxiosError, type AxiosResponse } from "axios"
import type { ReactNode } from "react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "@/components/ui/tooltip"
import { CalculationFeedback } from "@/features/chat/components/calculation-feedback"
import { chatKeys } from "@/features/chat/queries/keys"
import type { CalculationItem } from "@/features/chat/schemas/calculation-schemas"
import type { Message } from "@/features/chat/schemas/chat-schemas"
import { readCalculationFeedback } from "@/features/chat/utils/calculation-feedback"
import { buildMessage } from "@/test/fixtures/clarification"

const submitCalculationFeedback = vi.hoisted(() => vi.fn())
vi.mock("@/features/chat/api/chat-api", () => ({
  chatApi: { submitCalculationFeedback },
}))
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }))
vi.mock("sonner", () => ({ toast }))

const ITEM: CalculationItem = {
  item_id: "T1",
  mode: "llm",
  result_summary: null,
  run_id: "run-1",
  source_summary: { heading: "Chương II › Điều 8", title: "QĐ-123.pdf" },
  status: "computed",
}

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function setup(current?: Parameters<typeof CalculationFeedback>[0]["current"]) {
  const queryClient = new QueryClient()
  const message = buildMessage({
    content:
      "**Kết quả do AI tự tính, có thể sai - bạn kiểm tra lại giúp mình nhé**",
  })
  queryClient.setQueryData(chatKeys.messages(message.conversationId), [message])
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  )
  render(
    <CalculationFeedback
      conversationId={message.conversationId}
      current={current}
      item={ITEM}
      messageId={message.id}
    />,
    { wrapper }
  )
  const cached = () =>
    queryClient.getQueryData<Message[]>(
      chatKeys.messages(message.conversationId)
    )?.[0]
  return { cached, message, user: userEvent.setup() }
}

describe("CalculationFeedback", () => {
  it("sends CORRECT and writes the verdict into the cached message", async () => {
    submitCalculationFeedback.mockResolvedValue({
      itemId: "T1",
      reason: null,
      ticketCreated: false,
      verdict: "CORRECT",
    })
    const { cached, message, user } = setup()

    await user.click(screen.getByRole("button", { name: "Đúng" }))

    expect(submitCalculationFeedback).toHaveBeenCalledWith(message.id, {
      itemId: "T1",
      note: null,
      reason: null,
      verdict: "CORRECT",
    })
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Cảm ơn bạn đã phản hồi")
    )
    const stored = cached()
    expect(stored && readCalculationFeedback(stored).T1).toMatchObject({
      reason: null,
      verdict: "CORRECT",
    })
  })

  it("requires a reason, and a note for Khác, before sending WRONG", async () => {
    submitCalculationFeedback.mockResolvedValue({
      itemId: "T1",
      reason: "OTHER",
      ticketCreated: true,
      verdict: "WRONG",
    })
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: "Sai" }))
    const send = screen.getByRole("button", { name: "Gửi" })
    expect(
      screen.getByText(
        "Câu hỏi và các số bạn đã nhập sẽ được gửi cho bộ phận hỗ trợ để kiểm tra."
      )
    ).toBeInTheDocument()
    expect(send).toBeDisabled()

    await user.click(screen.getByRole("radio", { name: "Khác" }))
    expect(send).toBeDisabled()

    await user.type(screen.getByLabelText(/Ghi chú/), "Quy chế 2024 đã đổi")
    expect(send).toBeEnabled()
    await user.click(send)

    expect(submitCalculationFeedback).toHaveBeenCalledWith(expect.any(String), {
      itemId: "T1",
      note: "Quy chế 2024 đã đổi",
      reason: "OTHER",
      verdict: "WRONG",
    })
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Đã gửi cho bộ phận hỗ trợ")
    )
  })

  it("shows the stored verdict after a reload", async () => {
    const { user } = setup({
      at: "2026-10-09T00:00:00Z",
      reason: "WRONG_RESULT",
      verdict: "WRONG",
    })

    expect(screen.getByRole("button", { name: "Sai" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(screen.getByRole("button", { name: "Đúng" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    await user.click(screen.getByRole("button", { name: "Sai" }))
    expect(screen.getByRole("radio", { name: "Sai kết quả" })).toBeChecked()
  })

  it("locks both buttons on 409", async () => {
    submitCalculationFeedback.mockRejectedValue(
      new AxiosError("Conflict", "ERR_BAD_REQUEST", undefined, undefined, {
        data: { code: 4090, message: "Ticket đã xử lý" },
        status: 409,
      } as AxiosResponse)
    )
    const { user } = setup()

    await user.click(screen.getByRole("button", { name: "Đúng" }))

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Đúng" })).toBeDisabled()
    )
    expect(screen.getByRole("button", { name: "Sai" })).toBeDisabled()
    expect(
      screen.getByLabelText(/đã được bộ phận hỗ trợ xử lý xong/)
    ).toBeInTheDocument()
  })
})
