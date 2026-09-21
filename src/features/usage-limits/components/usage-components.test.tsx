import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { UsageMeter } from "@/features/usage-limits/components/usage-meter"
import { UsageWarningPanel } from "@/features/usage-limits/components/usage-warning-panel"
import type {
  MyUsage,
  UsageWindow,
} from "@/features/usage-limits/schemas/usage-limit-schemas"

const getMyUsage = vi.fn<() => Promise<MyUsage>>()

vi.mock("@/features/usage-limits/api/usage-limit-api", () => ({
  usageLimitApi: { getMyUsage: () => getMyUsage() },
}))

const inOneHour = () => new Date(Date.now() + 60 * 60 * 1000).toISOString()

const active = (remainingPercent: number): UsageWindow => ({
  remainingPercent,
  resetAt: inOneHour(),
  status: "ACTIVE",
})
const idle: UsageWindow = { remainingPercent: 100, status: "IDLE" }
const unlimited: UsageWindow = { status: "UNLIMITED" }

function renderPanel(onDismiss = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <UsageWarningPanel onDismiss={onDismiss} />
    </QueryClientProvider>
  )
  return onDismiss
}

afterEach(() => {
  cleanup()
  getMyUsage.mockReset()
})

describe("UsageWarningPanel", () => {
  it("shows the warning once 80% or more of a window is used", async () => {
    getMyUsage.mockResolvedValue({ daily: active(20), weekly: active(90) })
    renderPanel()

    expect(
      await screen.findByText("Sắp hết hạn mức sử dụng")
    ).toBeInTheDocument()
    expect(screen.getByText(/Đã dùng 80% hạn mức 24 giờ/)).toBeInTheDocument()
    expect(screen.queryByText(/hạn mức 7 ngày/)).not.toBeInTheDocument()
  })

  it("lists both windows when both are running low", async () => {
    getMyUsage.mockResolvedValue({ daily: active(5), weekly: active(15) })
    renderPanel()

    expect(await screen.findByText(/Đã dùng 95% hạn mức 24 giờ/)).toBeVisible()
    expect(screen.getByText(/Đã dùng 85% hạn mức 7 ngày/)).toBeVisible()
  })

  it("stays hidden below the threshold, when idle and when unlimited", async () => {
    getMyUsage.mockResolvedValue({ daily: active(21), weekly: idle })
    renderPanel()

    await waitFor(() => expect(getMyUsage).toHaveBeenCalled())
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("stays hidden for an unlimited plan", async () => {
    getMyUsage.mockResolvedValue({ daily: unlimited, weekly: unlimited })
    renderPanel()

    await waitFor(() => expect(getMyUsage).toHaveBeenCalled())
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("calls onDismiss when the close button is pressed", async () => {
    getMyUsage.mockResolvedValue({ daily: active(10), weekly: idle })
    const onDismiss = renderPanel()

    await userEvent.click(
      await screen.findByRole("button", { name: "Đóng cảnh báo" })
    )

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

describe("UsageMeter", () => {
  it("shows the percentage used and the time to reset, never a token count", () => {
    render(<UsageMeter label="Trong 24 giờ" window={active(62)} />)

    expect(screen.getByText("38% đã dùng")).toBeInTheDocument()
    expect(screen.getByText(/Làm mới sau/)).toBeInTheDocument()
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "38"
    )
  })

  it("says the window has not started when idle", () => {
    render(<UsageMeter label="Trong 7 ngày" window={idle} />)

    expect(screen.getByText("0% đã dùng")).toBeInTheDocument()
    expect(screen.getByText(/Chưa bắt đầu tính/)).toBeInTheDocument()
  })

  it("shows unlimited without a bar", () => {
    render(<UsageMeter label="Trong 24 giờ" window={unlimited} />)

    expect(screen.getByText("Không giới hạn")).toBeInTheDocument()
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
  })
})
