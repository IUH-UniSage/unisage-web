import { z } from "zod"

import type {
  AnsweredItem,
  Answer,
  ClarificationAnswers,
  ClarificationPanel,
  CourseRow,
  NumberSpec,
  Question,
} from "@/features/chat/schemas/clarification-schemas"

// Client-side mirror of the agent's `validate_answers` (SPEC-clarification-
// panel §1.5). The server stays the final judge (a 4010 still shows under the
// tab); this only keeps the submit button honest and errors immediate.

export const OTHER_TEXT_MAX_LENGTH = 200
export const TEXT_MAX_LENGTH = 200
export const COURSE_NAME_MAX_LENGTH = 80
export const COURSE_TABLE_MAX_ROWS = 30
export const NUMBER_LIST_MAX_ITEMS = 20
export const LETTER_GRADES = [
  "A+",
  "A",
  "B+",
  "B",
  "C+",
  "C",
  "D+",
  "D",
  "F",
] as const
const COURSE_CREDITS_MIN = 1
const COURSE_CREDITS_MAX = 10
const COURSE_SCORE_SPEC: NumberSpec = {
  max: "10",
  min: "0",
  step: "0.01",
  unit: null,
}

// ---------------------------------------------------------------- drafts

const choiceDraftSchema = z.object({
  kind: z.literal("choice"),
  optionId: z.string().nullable(),
  other: z.boolean(),
  otherText: z.string(),
})
const numberDraftSchema = z.object({
  kind: z.literal("number"),
  value: z.string(),
})
const numberListDraftSchema = z.object({
  kind: z.literal("number_list"),
  values: z.array(z.string()),
})
// `number_or_list`: either the already-aggregated value ("Nhập sẵn") or
// every column ("Nhập từng cột"); both inputs are kept so switching back and
// forth loses nothing, but only the active mode is sent.
const numberOrListDraftSchema = z.object({
  kind: z.literal("number_or_list"),
  mode: z.enum(["single", "list"]),
  value: z.string(),
  values: z.array(z.string()),
})
const textDraftSchema = z.object({
  kind: z.literal("text"),
  value: z.string(),
})
const courseRowDraftSchema = z.object({
  credits: z.string(),
  id: z.string(),
  name: z.string(),
  score: z.string(),
})
const courseTableDraftSchema = z.object({
  kind: z.literal("course_table"),
  rows: z.array(courseRowDraftSchema),
})
const questionDraftSchema = z.discriminatedUnion("kind", [
  choiceDraftSchema,
  numberDraftSchema,
  numberListDraftSchema,
  numberOrListDraftSchema,
  textDraftSchema,
  courseTableDraftSchema,
])

export type ChoiceDraft = z.infer<typeof choiceDraftSchema>
export type NumberDraft = z.infer<typeof numberDraftSchema>
export type NumberListDraft = z.infer<typeof numberListDraftSchema>
export type NumberOrListDraft = z.infer<typeof numberOrListDraftSchema>
export type NumberOrListMode = NumberOrListDraft["mode"]
export type TextDraft = z.infer<typeof textDraftSchema>
export type CourseRowDraft = z.infer<typeof courseRowDraftSchema>
export type CourseTableDraft = z.infer<typeof courseTableDraftSchema>
export type QuestionDraft = z.infer<typeof questionDraftSchema>
export type PanelDraft = Record<string, QuestionDraft>

export function emptyCourseRow(): CourseRowDraft {
  return { credits: "", id: crypto.randomUUID(), name: "", score: "" }
}

export function emptyQuestionDraft(question: Question): QuestionDraft {
  switch (question.kind) {
    case "choice":
      return { kind: "choice", optionId: null, other: false, otherText: "" }
    case "number":
      return { kind: "number", value: "" }
    case "number_list":
      return { kind: "number_list", values: [""] }
    case "number_or_list":
      return { kind: "number_or_list", mode: "list", value: "", values: [""] }
    case "text":
      return { kind: "text", value: "" }
    case "course_table":
      return { kind: "course_table", rows: [emptyCourseRow()] }
  }
}

/**
 * The starting draft of a panel: a stored draft (sessionStorage, untrusted)
 * is reused per question only when it still matches that question's kind.
 */
export function initialPanelDraft(
  panel: ClarificationPanel,
  stored: unknown
): PanelDraft {
  const storedRecord =
    stored && typeof stored === "object" && !Array.isArray(stored)
      ? (stored as Record<string, unknown>)
      : {}

  return Object.fromEntries(
    panel.questions.map((question) => {
      const parsed = questionDraftSchema.safeParse(storedRecord[question.id])
      const draft =
        parsed.success && parsed.data.kind === question.kind
          ? parsed.data
          : emptyQuestionDraft(question)
      return [question.id, draft]
    })
  )
}

/** Whether anything at all was typed or picked - decides if cancel confirms. */
export function hasDraftContent(draft: PanelDraft): boolean {
  return Object.values(draft).some((item) => {
    switch (item.kind) {
      case "choice":
        return item.optionId !== null || item.other
      case "number":
      case "text":
        return item.value.trim() !== ""
      case "number_list":
        return item.values.some((value) => value.trim() !== "")
      case "number_or_list":
        return (
          item.value.trim() !== "" ||
          item.values.some((value) => value.trim() !== "")
        )
      case "course_table":
        return item.rows.some(
          (row) => row.name.trim() || row.credits.trim() || row.score.trim()
        )
    }
  })
}

// --------------------------------------------------------------- decimals

const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/

/** "6,5" (Vietnamese decimal comma) -> "6.5"; null when not a plain number. */
export function normalizeDecimal(raw: string): string | null {
  const value = raw.trim().replace(",", ".")
  return DECIMAL_PATTERN.test(value) ? value : null
}

function decimalPlaces(value: string): number {
  return value.split(".")[1]?.length ?? 0
}

// Exact decimal -> scaled integer, so 0.1 + 0.2 style float error can never
// reject a valid step.
function toScaled(value: string, places: number): bigint {
  const negative = value.startsWith("-")
  const [whole, fraction = ""] = value.replace("-", "").split(".")
  const scaled = BigInt(whole + fraction.padEnd(places, "0"))
  return negative ? -scaled : scaled
}

/** The error for one decimal against `[min, max]` and `step`, or null. */
export function validateDecimal(raw: string, spec: NumberSpec): string | null {
  const value = normalizeDecimal(raw)
  if (value === null) return "Nhập một số hợp lệ"

  const places = Math.max(
    decimalPlaces(value),
    decimalPlaces(spec.min),
    decimalPlaces(spec.max),
    decimalPlaces(spec.step)
  )
  const scaled = toScaled(value, places)
  if (
    scaled < toScaled(spec.min, places) ||
    scaled > toScaled(spec.max, places)
  ) {
    return `Giá trị phải từ ${spec.min} đến ${spec.max}`
  }
  const step = toScaled(spec.step, places)
  if (step > 0n && scaled % step !== 0n) {
    return `Giá trị phải là bội của ${spec.step}`
  }
  return null
}

// ----------------------------------------------------------- course table

export type CourseRowErrors = Partial<
  Record<"credits" | "name" | "score", string>
>

function isBlankRow(row: CourseRowDraft): boolean {
  return !row.name.trim() && !row.credits.trim() && !row.score.trim()
}

function normalizeScore(raw: string): string | null {
  const letter = raw.trim().toUpperCase()
  if ((LETTER_GRADES as readonly string[]).includes(letter)) return letter
  const number = normalizeDecimal(raw)
  if (number === null) return null
  return validateDecimal(number, COURSE_SCORE_SPEC) === null ? number : null
}

/** Per-cell errors of one row; a fully blank row has none (it is skipped). */
export function validateCourseRow(row: CourseRowDraft): CourseRowErrors {
  if (isBlankRow(row)) return {}

  const errors: CourseRowErrors = {}
  if (row.name.trim().length > COURSE_NAME_MAX_LENGTH) {
    errors.name = `Tên môn tối đa ${COURSE_NAME_MAX_LENGTH} ký tự`
  }
  const credits = Number(row.credits.trim())
  if (
    !/^\d+$/.test(row.credits.trim()) ||
    credits < COURSE_CREDITS_MIN ||
    credits > COURSE_CREDITS_MAX
  ) {
    errors.credits = `Số tín chỉ là số nguyên từ ${COURSE_CREDITS_MIN} đến ${COURSE_CREDITS_MAX}`
  }
  if (normalizeScore(row.score) === null) {
    errors.score = "Điểm từ 0 đến 10 hoặc điểm chữ A+ … F"
  }
  return errors
}

function toCourseRow(row: CourseRowDraft): CourseRow {
  const name = row.name.trim()
  return {
    credits: Number(row.credits.trim()),
    name: name || null,
    score: normalizeScore(row.score) ?? row.score.trim(),
  }
}

// ------------------------------------------------------------- questions

export type QuestionResult =
  | { state: "empty" }
  | { message: string; state: "invalid" }
  | { answer: Answer; item: AnsweredItem; state: "valid" }

function withUnit(value: string, spec: NumberSpec | null): string {
  return spec?.unit ? `${value} ${spec.unit}` : value
}

function baseItem(question: Question) {
  return {
    kind: question.kind,
    prompt: question.prompt,
    question_id: question.id,
    tab_label: question.tab_label,
  }
}

function validateSingleNumber(
  question: Question,
  raw: string,
  display: (value: string) => string
): QuestionResult {
  if (!raw.trim()) return { state: "empty" }
  if (!question.number) {
    return { message: "Câu hỏi thiếu cấu hình số", state: "invalid" }
  }
  const error = validateDecimal(raw, question.number)
  if (error) return { message: error, state: "invalid" }
  const value = normalizeDecimal(raw) ?? raw.trim()
  return {
    answer: { number: value, question_id: question.id },
    item: { ...baseItem(question), display: display(value) },
    state: "valid",
  }
}

function validateNumberList(
  question: Question,
  values: string[],
  display: (numbers: string[]) => string
): QuestionResult {
  const filled = values.filter((value) => value.trim())
  if (!filled.length) return { state: "empty" }
  if (!question.number) {
    return { message: "Câu hỏi thiếu cấu hình số", state: "invalid" }
  }
  const maxItems = question.max_items ?? NUMBER_LIST_MAX_ITEMS
  if (filled.length > maxItems) {
    return { message: `Tối đa ${maxItems} giá trị`, state: "invalid" }
  }
  const spec = question.number
  const firstError = filled
    .map((value) => validateDecimal(value, spec))
    .find((error) => error !== null)
  if (firstError) return { message: firstError, state: "invalid" }
  const numbers = filled.map((value) => normalizeDecimal(value) ?? value.trim())
  return {
    answer: { numbers, question_id: question.id },
    item: { ...baseItem(question), display: display(numbers) },
    state: "valid",
  }
}

/** Validates one question's draft and builds its contract `Answer`. */
export function validateQuestion(
  question: Question,
  draft: QuestionDraft
): QuestionResult {
  if (draft.kind !== question.kind) return { state: "empty" }

  switch (draft.kind) {
    case "choice": {
      if (draft.other) {
        if (!question.allow_other) {
          return {
            message: "Câu này không nhận câu trả lời khác",
            state: "invalid",
          }
        }
        const text = draft.otherText.trim()
        if (!text) {
          return {
            message: "Nhập nội dung cho lựa chọn Khác",
            state: "invalid",
          }
        }
        if (text.length > OTHER_TEXT_MAX_LENGTH) {
          return {
            message: `Tối đa ${OTHER_TEXT_MAX_LENGTH} ký tự`,
            state: "invalid",
          }
        }
        return {
          answer: { other_text: text, question_id: question.id },
          item: { ...baseItem(question), display: text, option_id: null },
          state: "valid",
        }
      }
      const option = question.options.find((it) => it.id === draft.optionId)
      if (!option) return { state: "empty" }
      return {
        answer: { option_id: option.id, question_id: question.id },
        item: {
          ...baseItem(question),
          display: option.label,
          option_id: option.id,
        },
        state: "valid",
      }
    }
    case "number":
      return validateSingleNumber(question, draft.value, (value) =>
        withUnit(value, question.number)
      )
    case "number_list":
      return validateNumberList(question, draft.values, (numbers) =>
        withUnit(numbers.join(", "), question.number)
      )
    case "number_or_list":
      // Same display wording the agent stores (contract §5).
      return draft.mode === "single"
        ? validateSingleNumber(
            question,
            draft.value,
            (value) => `Nhập sẵn: ${value}`
          )
        : validateNumberList(
            question,
            draft.values,
            (numbers) => `Từng cột: ${numbers.join(", ")}`
          )
    case "text": {
      const text = draft.value.trim()
      if (!text) return { state: "empty" }
      const maxLength = question.max_length ?? TEXT_MAX_LENGTH
      if (text.length > maxLength) {
        return { message: `Tối đa ${maxLength} ký tự`, state: "invalid" }
      }
      return {
        answer: { question_id: question.id, text },
        item: { ...baseItem(question), display: text },
        state: "valid",
      }
    }
    case "course_table": {
      const rows = draft.rows.filter((row) => !isBlankRow(row))
      if (!rows.length) return { state: "empty" }
      const maxRows = question.max_items ?? COURSE_TABLE_MAX_ROWS
      if (rows.length > maxRows) {
        return { message: `Tối đa ${maxRows} môn`, state: "invalid" }
      }
      if (rows.some((row) => Object.keys(validateCourseRow(row)).length)) {
        return { message: "Kiểm tra lại các ô được đánh dấu", state: "invalid" }
      }
      const courseRows = rows.map(toCourseRow)
      return {
        answer: { question_id: question.id, rows: courseRows },
        item: { ...baseItem(question), display: null, rows: courseRows },
        state: "valid",
      }
    }
  }
}

export function validatePanel(
  panel: ClarificationPanel,
  draft: PanelDraft
): Record<string, QuestionResult> {
  return Object.fromEntries(
    panel.questions.map((question) => {
      const item = draft[question.id] ?? emptyQuestionDraft(question)
      return [question.id, validateQuestion(question, item)]
    })
  )
}

function summarizeItem(item: AnsweredItem): string {
  if (item.rows) {
    const rows = item.rows
      .map((row) => `${row.name ?? "Môn"} (${row.credits} TC): ${row.score}`)
      .join("; ")
    return `${item.tab_label}: ${rows}`
  }
  return `${item.tab_label}: ${item.display ?? ""}`
}

/**
 * The submit payload when every question has a valid answer, else null:
 * `answers` for the request (one per question, in tab order), `card` in the
 * shape of `metadata.clarification_answers` for the optimistic USER message,
 * and `summary` - the USER message's text content.
 */
export function buildSubmission(
  panel: ClarificationPanel,
  draft: PanelDraft
): { answers: Answer[]; card: ClarificationAnswers; summary: string } | null {
  const results = validatePanel(panel, draft)
  const valid = panel.questions.flatMap((question) => {
    const result = results[question.id]
    return result.state === "valid" ? [result] : []
  })
  if (valid.length !== panel.questions.length) return null

  const items = valid.map((result) => result.item)
  return {
    answers: valid.map((result) => result.answer),
    card: { items, panel_id: panel.panel_id, schema_version: 1 },
    summary: items.map(summarizeItem).join("\n"),
  }
}
