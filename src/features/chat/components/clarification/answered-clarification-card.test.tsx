import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import {
  AnsweredClarificationCard,
  CancelledClarificationCard,
} from "@/features/chat/components/clarification/answered-clarification-card"
import { CONTRACT_ANSWERS, CONTRACT_PANEL } from "@/test/fixtures/clarification"

afterEach(() => {
  cleanup()
})

describe("AnsweredClarificationCard", () => {
  it("is open by default and shows the course table rows", () => {
    render(
      <AnsweredClarificationCard
        answers={CONTRACT_ANSWERS}
        panel={CONTRACT_PANEL}
      />
    )

    expect(
      screen.getByRole("button", { name: "Đã trả lời · 3 câu hỏi" })
    ).toHaveAttribute("aria-expanded", "true")
    const table = screen.getByRole("table")
    const rows = within(table).getAllByRole("row")
    expect(rows).toHaveLength(3)
    expect(rows[1]).toHaveTextContent("Toán38.5")
    expect(rows[2]).toHaveTextContent("—2B+")
    expect(screen.getByText("9, 8")).toBeInTheDocument()
  })

  it("lists every option of a choice question with the chosen one current", () => {
    render(
      <AnsweredClarificationCard
        answers={CONTRACT_ANSWERS}
        panel={CONTRACT_PANEL}
      />
    )

    const options = screen.getAllByRole("listitem")
    expect(options.map((item) => item.textContent)).toEqual([
      "K19",
      "K20(Đề xuất)Nhập học 2020",
    ])
    expect(options[1]).toHaveAttribute("aria-current", "true")
    expect(options[0]).not.toHaveAttribute("aria-current")
  })

  it("adds a selected Khác line when the answer was free text", () => {
    render(
      <AnsweredClarificationCard
        answers={{
          ...CONTRACT_ANSWERS,
          items: [
            { ...CONTRACT_ANSWERS.items[0], display: "K18", option_id: null },
          ],
        }}
        panel={CONTRACT_PANEL}
      />
    )

    expect(screen.getByText("Khác: K18").closest("li")).toHaveAttribute(
      "aria-current",
      "true"
    )
  })

  it("falls back to the display text without a matching panel", () => {
    render(
      <AnsweredClarificationCard answers={CONTRACT_ANSWERS} panel={null} />
    )
    expect(screen.getByText("K20")).toBeInTheDocument()
    expect(screen.queryByText("K19")).not.toBeInTheDocument()
  })
})

describe("CancelledClarificationCard", () => {
  it("is collapsed and expands to the questions with nothing selected", async () => {
    const user = userEvent.setup()
    render(<CancelledClarificationCard panel={CONTRACT_PANEL} />)

    const toggle = screen.getByRole("button", { name: "Đã huỷ · 5 câu hỏi" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText("Bạn thuộc khoá nào?")).not.toBeInTheDocument()

    await user.click(toggle)
    expect(screen.getByText("Bạn thuộc khoá nào?")).toBeInTheDocument()
    expect(
      screen
        .getAllByRole("listitem")
        .every((item) => !item.hasAttribute("aria-current"))
    ).toBe(true)
  })
})
