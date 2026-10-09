import { z } from "zod"

// Mirrors unisage-agent/contracts/chat-sse.md (canonical). Every object is
// `.strict()` like the agent's Pydantic models: an unknown field means the
// payload is not the shape this client was built against, so it is treated
// as absent rather than half-rendered.

export const questionKindSchema = z.enum([
  "choice",
  "number",
  "number_list",
  "text",
  "course_table",
])

export const choiceOptionSchema = z
  .object({
    description: z.string().nullable(),
    id: z.string().min(1),
    label: z.string().min(1),
    recommended: z.boolean(),
  })
  .strict()

// Decimals travel as strings ("7.5") so no precision is lost on the way.
export const numberSpecSchema = z
  .object({
    max: z.string(),
    min: z.string(),
    step: z.string(),
    unit: z.string().nullable(),
  })
  .strict()

export const questionSchema = z
  .object({
    allow_other: z.boolean(),
    id: z.string().min(1),
    kind: questionKindSchema,
    max_items: z.number().int().positive().nullable(),
    max_length: z.number().int().positive().nullable(),
    number: numberSpecSchema.nullable(),
    options: z.array(choiceOptionSchema),
    prompt: z.string(),
    tab_label: z.string().min(1),
  })
  .strict()

export const clarificationPanelSchema = z
  .object({
    panel_id: z.string().min(1),
    questions: z.array(questionSchema).min(1).max(12),
    schema_version: z.literal(1),
  })
  .strict()

// `metadata.clarification` on the ASSISTANT message that showed the panel.
export const clarificationMetadataSchema = z
  .object({
    panel: clarificationPanelSchema,
    schema_version: z.literal(1),
    status: z.enum(["open", "cancelled"]),
  })
  .strict()

export const courseRowSchema = z
  .object({
    credits: z.number().int(),
    name: z.string().nullable(),
    score: z.string(),
  })
  .strict()

export const answerSchema = z.union([
  z.object({ option_id: z.string(), question_id: z.string() }).strict(),
  z.object({ other_text: z.string(), question_id: z.string() }).strict(),
  z.object({ number: z.string(), question_id: z.string() }).strict(),
  z.object({ numbers: z.array(z.string()), question_id: z.string() }).strict(),
  z.object({ question_id: z.string(), text: z.string() }).strict(),
  z
    .object({ question_id: z.string(), rows: z.array(courseRowSchema) })
    .strict(),
])

// `metadata.clarification_answers` on the USER message of a submit turn - the
// data behind the bordered answer card.
export const answeredItemSchema = z
  .object({
    display: z.string().nullable(),
    kind: questionKindSchema,
    // Only on `choice`: the picked option, or null when "Khác" was used
    // (then `display` is the typed text).
    option_id: z.string().nullable().optional(),
    prompt: z.string(),
    question_id: z.string(),
    rows: z.array(courseRowSchema).optional(),
    tab_label: z.string(),
  })
  .strict()

export const clarificationAnswersSchema = z
  .object({
    items: z.array(answeredItemSchema).min(1),
    panel_id: z.string().min(1),
    schema_version: z.literal(1),
  })
  .strict()

// `event: clarification_closed` - only in the response to a cancel.
export const clarificationClosedSchema = z
  .object({
    panel_id: z.string(),
    status: z.literal("cancelled"),
  })
  .strict()

// `errors[]` of a 400/4010 CLARIFICATION_INVALID response.
export const clarificationFieldErrorSchema = z.object({
  question_id: z.string(),
  reason: z.string(),
})

export type QuestionKind = z.infer<typeof questionKindSchema>
export type ChoiceOption = z.infer<typeof choiceOptionSchema>
export type NumberSpec = z.infer<typeof numberSpecSchema>
export type Question = z.infer<typeof questionSchema>
export type ClarificationPanel = z.infer<typeof clarificationPanelSchema>
export type ClarificationMetadata = z.infer<typeof clarificationMetadataSchema>
export type CourseRow = z.infer<typeof courseRowSchema>
export type Answer = z.infer<typeof answerSchema>
export type AnsweredItem = z.infer<typeof answeredItemSchema>
export type ClarificationAnswers = z.infer<typeof clarificationAnswersSchema>
export type ClarificationClosed = z.infer<typeof clarificationClosedSchema>
export type ClarificationFieldError = z.infer<
  typeof clarificationFieldErrorSchema
>

// `clarification` of a `POST /chat/stream` body (contract §1).
export type ClarificationRequest =
  | { action: "submit"; answers: Answer[]; panel_id: string }
  | { action: "cancel"; panel_id: string }
