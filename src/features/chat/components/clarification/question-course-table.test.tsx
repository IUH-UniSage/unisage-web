import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it } from "vitest"

import { QuestionCourseTable } from "@/features/chat/components/clarification/question-course-table"
import {
  type CourseTableDraft,
  emptyCourseRow,
} from "@/features/chat/utils/clarification-answers"
import { CONTRACT_PANEL } from "@/test/fixtures/clarification"

const QUESTION = CONTRACT_PANEL.questions[3]

function Harness({ initialRows = 1 }: { initialRows?: number }) {
  const [draft, setDraft] = useState<CourseTableDraft>({
    kind: "course_table",
    rows: Array.from({ length: initialRows }, emptyCourseRow),
  })
  return (
    <QuestionCourseTable
      draft={draft}
      error={null}
      onChange={setDraft}
      question={QUESTION}
    />
  )
}

afterEach(() => {
  cleanup()
})

describe("QuestionCourseTable", () => {
  it("adds and removes rows", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole("button", { name: "Thêm môn" }))
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getByText("2/30 môn")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Xoá môn 2" }))
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
    // The last row cannot be removed.
    expect(screen.getByRole("button", { name: "Xoá môn 1" })).toBeDisabled()
  })

  it("stops at 30 rows", () => {
    render(<Harness initialRows={30} />)
    expect(screen.getByRole("button", { name: "Thêm môn" })).toBeDisabled()
  })

  it("accepts letter grades and flags invalid cells", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByLabelText("Môn 1: tín chỉ"), "3")
    await user.type(screen.getByLabelText("Môn 1: điểm"), "a+")
    expect(screen.queryByText(/Điểm từ 0 đến 10/)).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText("Môn 1: điểm"))
    await user.type(screen.getByLabelText("Môn 1: điểm"), "E")
    expect(screen.getByText(/Điểm từ 0 đến 10/)).toBeInTheDocument()

    await user.clear(screen.getByLabelText("Môn 1: tín chỉ"))
    await user.type(screen.getByLabelText("Môn 1: tín chỉ"), "12")
    expect(screen.getByText(/Số tín chỉ là số nguyên/)).toBeInTheDocument()
  })
})
