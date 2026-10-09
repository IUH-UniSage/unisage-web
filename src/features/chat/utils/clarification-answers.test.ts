import { describe, expect, it } from "vitest"

import type { Question } from "@/features/chat/schemas/clarification-schemas"
import {
  buildSubmission,
  hasDraftContent,
  initialPanelDraft,
  normalizeDecimal,
  type PanelDraft,
  validateCourseRow,
  validateDecimal,
  validateQuestion,
} from "@/features/chat/utils/clarification-answers"
import { CONTRACT_PANEL } from "@/test/fixtures/clarification"

const [choiceQ, numberQ, numberListQ, courseQ] = CONTRACT_PANEL.questions
const SCORE = { max: "10", min: "0", step: "0.01", unit: null }

const textQ: Question = {
  allow_other: false,
  id: "q5",
  kind: "text",
  max_items: null,
  max_length: 10,
  number: null,
  options: [],
  prompt: "Hệ đào tạo",
  tab_label: "Hệ",
}

function row(name: string, credits: string, score: string) {
  return { credits, id: crypto.randomUUID(), name, score }
}

describe("validateDecimal", () => {
  it("accepts values in range on the step, including a decimal comma", () => {
    expect(validateDecimal("6.5", SCORE)).toBeNull()
    expect(validateDecimal("6,25", SCORE)).toBeNull()
    expect(validateDecimal("0", SCORE)).toBeNull()
    expect(validateDecimal("10", SCORE)).toBeNull()
    expect(normalizeDecimal(" 7,5 ")).toBe("7.5")
  })

  it("rejects out of range, off-step and non-numbers", () => {
    expect(validateDecimal("11", SCORE)).toMatch("từ 0 đến 10")
    expect(validateDecimal("-1", SCORE)).toMatch("từ 0 đến 10")
    expect(validateDecimal("6.555", SCORE)).toMatch("bội của 0.01")
    expect(validateDecimal("abc", SCORE)).toMatch("số hợp lệ")
    expect(validateDecimal("1e2", SCORE)).toMatch("số hợp lệ")
    expect(
      validateDecimal("2.5", { max: "10", min: "1", step: "1", unit: null })
    ).toMatch("bội của 1")
  })
})

describe("validateQuestion", () => {
  it("choice: option_id, or other_text only when allow_other", () => {
    expect(
      validateQuestion(choiceQ, {
        kind: "choice",
        optionId: "k20",
        other: false,
        otherText: "",
      })
    ).toMatchObject({
      answer: { option_id: "k20", question_id: "q1" },
      item: { display: "K20", option_id: "k20" },
      state: "valid",
    })
    expect(
      validateQuestion(choiceQ, {
        kind: "choice",
        optionId: null,
        other: true,
        otherText: "  ",
      })
    ).toEqual({ message: "Nhập nội dung cho lựa chọn Khác", state: "invalid" })
    expect(
      validateQuestion(choiceQ, {
        kind: "choice",
        optionId: null,
        other: true,
        otherText: " K18 ",
      })
    ).toMatchObject({
      answer: { other_text: "K18", question_id: "q1" },
      item: { display: "K18", option_id: null },
    })
    expect(
      validateQuestion(
        { ...choiceQ, allow_other: false },
        { kind: "choice", optionId: null, other: true, otherText: "x" }
      ).state
    ).toBe("invalid")
    expect(
      validateQuestion(choiceQ, {
        kind: "choice",
        optionId: "unknown",
        other: false,
        otherText: "",
      }).state
    ).toBe("empty")
  })

  it("number and number_list: range, step, max_items", () => {
    expect(
      validateQuestion(numberQ, { kind: "number", value: "6,5" })
    ).toMatchObject({ answer: { number: "6.5", question_id: "q2" } })
    expect(
      validateQuestion(numberQ, { kind: "number", value: "10.5" }).state
    ).toBe("invalid")
    expect(
      validateQuestion(numberListQ, {
        kind: "number_list",
        values: ["9", "", "8"],
      })
    ).toMatchObject({
      answer: { numbers: ["9", "8"], question_id: "q3" },
      item: { display: "9, 8" },
    })
    expect(
      validateQuestion(
        { ...numberListQ, max_items: 1 },
        { kind: "number_list", values: ["9", "8"] }
      )
    ).toEqual({ message: "Tối đa 1 giá trị", state: "invalid" })
  })

  it("text: trimmed, not empty, max_length", () => {
    expect(validateQuestion(textQ, { kind: "text", value: "   " }).state).toBe(
      "empty"
    )
    expect(
      validateQuestion(textQ, { kind: "text", value: "Chất lượng cao" }).state
    ).toBe("invalid")
    expect(
      validateQuestion(textQ, { kind: "text", value: " CLC " })
    ).toMatchObject({ answer: { question_id: "q5", text: "CLC" } })
  })

  it("course_table: skips blank rows, letter grades, credits 1..10", () => {
    expect(
      validateQuestion(courseQ, {
        kind: "course_table",
        rows: [row("Toán", "3", "8,5"), row("", "", ""), row("", "2", "b+")],
      })
    ).toMatchObject({
      answer: {
        question_id: "q4",
        rows: [
          { credits: 3, name: "Toán", score: "8.5" },
          { credits: 2, name: null, score: "B+" },
        ],
      },
      item: { display: null },
    })
    expect(validateCourseRow(row("", "11", "8"))).toHaveProperty("credits")
    expect(validateCourseRow(row("", "2.5", "8"))).toHaveProperty("credits")
    expect(validateCourseRow(row("", "2", "E"))).toHaveProperty("score")
    expect(validateCourseRow(row("", "2", "10.5"))).toHaveProperty("score")
    expect(validateCourseRow(row("x".repeat(81), "2", "A"))).toHaveProperty(
      "name"
    )
    expect(
      validateQuestion(
        { ...courseQ, max_items: 1 },
        { kind: "course_table", rows: [row("", "2", "A"), row("", "3", "B")] }
      ).state
    ).toBe("invalid")
  })
})

describe("buildSubmission", () => {
  const complete: PanelDraft = {
    q1: { kind: "choice", optionId: "k20", other: false, otherText: "" },
    q2: { kind: "number", value: "6.5" },
    q3: { kind: "number_list", values: ["9", "8"] },
    q4: {
      kind: "course_table",
      rows: [row("Toán", "3", "8.5"), row("", "2", "B+")],
    },
  }

  it("builds the contract answers (one per question, in tab order)", () => {
    const submission = buildSubmission(CONTRACT_PANEL, complete)

    // contracts/chat-sse.md §1 table, verbatim values.
    expect(submission?.answers).toEqual([
      { option_id: "k20", question_id: "q1" },
      { number: "6.5", question_id: "q2" },
      { numbers: ["9", "8"], question_id: "q3" },
      {
        question_id: "q4",
        rows: [
          { credits: 3, name: "Toán", score: "8.5" },
          { credits: 2, name: null, score: "B+" },
        ],
      },
    ])
    expect(submission?.card.panel_id).toBe(CONTRACT_PANEL.panel_id)
    expect(submission?.card.items.map((item) => item.display)).toEqual([
      "K20",
      "6.5",
      "9, 8",
      null,
    ])
    expect(submission?.summary).toContain("Khoá: K20")
  })

  it("returns null while any question is unanswered or invalid", () => {
    expect(
      buildSubmission(CONTRACT_PANEL, {
        ...complete,
        q2: { kind: "number", value: "" },
      })
    ).toBeNull()
    expect(
      buildSubmission(CONTRACT_PANEL, {
        ...complete,
        q2: { kind: "number", value: "12" },
      })
    ).toBeNull()
  })
})

describe("initialPanelDraft / hasDraftContent", () => {
  it("restores a stored draft per question and drops mismatched kinds", () => {
    const draft = initialPanelDraft(CONTRACT_PANEL, {
      q1: { kind: "choice", optionId: "k19", other: false, otherText: "" },
      q2: { kind: "text", value: "wrong kind" },
      q9: { kind: "number", value: "1" },
    })

    expect(draft.q1).toEqual({
      kind: "choice",
      optionId: "k19",
      other: false,
      otherText: "",
    })
    expect(draft.q2).toEqual({ kind: "number", value: "" })
    expect(draft).not.toHaveProperty("q9")
    expect(hasDraftContent(draft)).toBe(true)
  })

  it("starts empty for garbage storage", () => {
    const draft = initialPanelDraft(CONTRACT_PANEL, "not an object")
    expect(hasDraftContent(draft)).toBe(false)
  })
})
