import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { ClarificationPanel } from "@/features/chat/components/clarification/clarification-panel"
import type { ClarificationPanel as PanelData } from "@/features/chat/schemas/clarification-schemas"
import { CONTRACT_PANEL, MANY_TABS_PANEL } from "@/test/fixtures/clarification"

// Choice + number + course_table, the three-tab panel of the e2e scenario.
const PANEL: PanelData = {
  ...CONTRACT_PANEL,
  questions: [
    CONTRACT_PANEL.questions[0],
    CONTRACT_PANEL.questions[1],
    CONTRACT_PANEL.questions[3],
  ],
}

beforeAll(() => {
  // Radix measures radios/tabs; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

afterEach(() => {
  cleanup()
  window.sessionStorage.clear()
  vi.restoreAllMocks()
})

function renderPanel(
  overrides: Partial<Parameters<typeof ClarificationPanel>[0]> = {}
) {
  const onCancel = vi.fn()
  const onSubmit = vi.fn()
  render(
    <ClarificationPanel
      onCancel={onCancel}
      onSubmit={onSubmit}
      panel={PANEL}
      serverErrors={{}}
      {...overrides}
    />
  )
  return { onCancel, onSubmit }
}

async function answerAll(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: /K20/ }))
  await user.click(screen.getByRole("tab", { name: /Điểm CK/ }))
  await user.type(screen.getByLabelText("Điểm cuối kỳ (thang 10)"), "6.5")
  await user.click(screen.getByRole("tab", { name: /Các môn/ }))
  await user.type(screen.getByLabelText("Môn 1: tín chỉ"), "3")
  await user.type(screen.getByLabelText("Môn 1: điểm"), "B+")
}

describe("ClarificationPanel", () => {
  it("keeps submit disabled until every tab has a valid answer", async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderPanel()
    const submit = screen.getByRole("button", { name: "Gửi câu trả lời" })

    expect(submit).toBeDisabled()
    expect(screen.getByText("Còn 3 câu")).toBeInTheDocument()

    await answerAll(user)

    expect(screen.queryByText(/Còn \d câu/)).not.toBeInTheDocument()
    expect(submit).toBeEnabled()
    await user.click(submit)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0].answers).toEqual([
      { option_id: "k20", question_id: "q1" },
      { number: "6.5", question_id: "q2" },
      { question_id: "q4", rows: [{ credits: 3, name: null, score: "B+" }] },
    ])
  })

  it("marks answered tabs and moves on with Enter on an option", async () => {
    const user = userEvent.setup()
    renderPanel()

    screen.getByRole("radio", { name: /K19/ }).focus()
    await user.keyboard("{Enter}")

    expect(screen.getByRole("tab", { name: /Khoá/ })).toHaveTextContent(
      "đã trả lời"
    )
    expect(screen.getByRole("tab", { name: /Điểm CK/ })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })

  it("requires text when Khác is chosen", async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole("radio", { name: "Khác" }))
    expect(
      screen.getByText("Nhập nội dung cho lựa chọn Khác")
    ).toBeInTheDocument()
    expect(screen.getByText("Còn 3 câu")).toBeInTheDocument()

    await user.type(screen.getByLabelText("Nội dung khác"), "K18")
    expect(screen.getByText("Còn 2 câu")).toBeInTheDocument()
  })

  it("cancels right away on Esc without a draft", async () => {
    const user = userEvent.setup()
    const { onCancel } = renderPanel()

    await user.keyboard("{Escape}")
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("asks to confirm Esc once something was answered", async () => {
    const user = userEvent.setup()
    const { onCancel } = renderPanel()

    await user.click(screen.getByRole("radio", { name: /K20/ }))
    await user.keyboard("{Escape}")

    const dialog = await screen.findByRole("dialog", { name: "Huỷ câu hỏi?" })
    expect(onCancel).not.toHaveBeenCalled()
    await user.click(
      within(dialog).getByRole("button", { name: "Huỷ câu hỏi" })
    )
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("shows a 4010 error on its own tab", async () => {
    const user = userEvent.setup()
    renderPanel({ serverErrors: { q2: "Điểm vượt quá thang điểm" } })

    const tab = screen.getByRole("tab", { name: /Điểm CK/ })
    expect(within(tab).getByRole("img", { name: "Có lỗi" })).toBeInTheDocument()
    expect(
      within(screen.getByRole("tab", { name: /Khoá/ })).queryByRole("img")
    ).not.toBeInTheDocument()

    await user.click(tab)
    expect(screen.getByText("Điểm vượt quá thang điểm")).toBeInTheDocument()
  })

  it("restores the draft from sessionStorage and survives storage errors", async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <ClarificationPanel
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        panel={PANEL}
        serverErrors={{}}
      />
    )
    await user.click(screen.getByRole("radio", { name: /K20/ }))
    unmount()

    renderPanel()
    expect(screen.getByRole("radio", { name: /K20/ })).toBeChecked()
  })

  it("still works when sessionStorage throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole("radio", { name: /K20/ }))
    expect(screen.getByText("Còn 2 câu")).toBeInTheDocument()
  })

  it("switches number_or_list between columns and the averaged value", async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderPanel({
      panel: { ...PANEL, questions: [CONTRACT_PANEL.questions[4]] },
    })

    // Columns by default.
    await user.type(screen.getByLabelText("Điểm TX 1"), "8")
    await user.click(screen.getByRole("button", { name: "Thêm cột" }))
    await user.type(screen.getByLabelText("Điểm TX 2"), "7")
    await user.click(
      screen.getByRole("button", {
        name: "Đã có điểm trung bình? Nhập trực tiếp",
      })
    )
    expect(screen.getByText("Còn 1 câu")).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Điểm thường xuyên/), "7,3")
    await user.click(screen.getByRole("button", { name: "Gửi câu trả lời" }))
    expect(onSubmit.mock.calls[0][0].answers).toEqual([
      { number: "7.3", question_id: "q5" },
    ])

    // Back to the columns: what was typed there is still there.
    await user.click(
      screen.getByRole("button", {
        name: "Nhập từng cột thay vì điểm trung bình",
      })
    )
    expect(screen.getByLabelText("Điểm TX 2")).toHaveValue("7")
  })

  it("shows every tab of a long panel in a horizontally scrolling list", () => {
    renderPanel({ panel: MANY_TABS_PANEL })

    expect(screen.getAllByRole("tab")).toHaveLength(15)
    expect(screen.getByText("Còn 15 câu")).toBeInTheDocument()
    expect(screen.getByRole("tablist")).toHaveClass("overflow-x-auto")
  })

  it("moves to the next tab on Enter and focuses its first input", async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole("tab", { name: /Điểm CK/ }))
    await user.type(
      screen.getByLabelText("Điểm cuối kỳ (thang 10)"),
      "6.5{Enter}"
    )

    expect(screen.getByRole("tab", { name: /Các môn/ })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    await waitFor(() =>
      expect(screen.getByLabelText("Môn 1: tên môn")).toHaveFocus()
    )
  })

  it("submits on Enter in the last tab when everything is answered", async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderPanel()

    await answerAll(user)
    await user.keyboard("{Enter}")

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it("goes back to the first unanswered tab on Enter in the last tab", async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderPanel()

    await user.click(screen.getByRole("tab", { name: /Các môn/ }))
    await user.type(screen.getByLabelText("Môn 1: tín chỉ"), "3")
    await user.type(screen.getByLabelText("Môn 1: điểm"), "B+{Enter}")

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("tab", { name: /Khoá/ })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })

  it("does not move on while an IME is composing", () => {
    renderPanel()
    const radio = screen.getByRole("radio", { name: /K19/ })
    radio.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        isComposing: true,
        key: "Enter",
      })
    )
    expect(screen.getByRole("tab", { name: /Khoá/ })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })

  it("focuses the input that + just added", async () => {
    const user = userEvent.setup()
    renderPanel({
      panel: { ...PANEL, questions: [CONTRACT_PANEL.questions[2]] },
    })

    await user.type(screen.getByLabelText("Điểm TH 1"), "9")
    await user.click(screen.getByRole("button", { name: "Thêm cột" }))

    expect(screen.getByLabelText("Điểm TH 2")).toHaveFocus()
  })
})
