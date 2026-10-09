import { z } from "zod"

// unisage-agent contracts/chat-sse.md §5b: the public part of a calculation
// trace on an ASSISTANT message, and the Đúng/Sai feedback the backend writes.

export const calculationItemSchema = z
  .object({
    item_id: z.string().min(1),
    mode: z.enum(["builtin", "llm"]),
    // Only built-in (Python) results have one; an AI-computed item sends null.
    result_summary: z.string().nullable(),
    run_id: z.string(),
    source_summary: z
      .object({
        heading: z.string().nullable(),
        title: z.string(),
      })
      .strict()
      .nullable(),
    status: z.enum(["computed", "needs_input", "unresolved"]),
  })
  .strict()

export const calculationMetadataSchema = z
  .object({
    items: z.array(calculationItemSchema),
    schema_version: z.literal(1),
  })
  .strict()

export const calculationVerdictSchema = z.enum(["CORRECT", "WRONG"])
export const calculationWrongReasonSchema = z.enum([
  "WRONG_FORMULA",
  "WRONG_RESULT",
  "WRONG_SOURCE",
  "MISSING_INFO",
  "OTHER",
])

export const calculationFeedbackEntrySchema = z
  .object({
    at: z.string(),
    reason: calculationWrongReasonSchema.nullable(),
    verdict: calculationVerdictSchema,
  })
  .strict()

export const calculationFeedbackMetadataSchema = z.record(
  z.string(),
  calculationFeedbackEntrySchema
)

export const CALCULATION_FEEDBACK_NOTE_MAX_LENGTH = 500

export const calculationFeedbackRequestSchema = z
  .object({
    itemId: z.string().min(1),
    note: z.string().max(CALCULATION_FEEDBACK_NOTE_MAX_LENGTH).nullable(),
    reason: calculationWrongReasonSchema.nullable(),
    verdict: calculationVerdictSchema,
  })
  .refine((body) => (body.verdict === "CORRECT") === (body.reason === null), {
    message: "reason is required for WRONG and must be null for CORRECT",
  })
  .refine((body) => body.reason !== "OTHER" || Boolean(body.note?.trim()), {
    message: "note is required for OTHER",
  })

export const calculationFeedbackResponseSchema = z.object({
  itemId: z.string(),
  reason: calculationWrongReasonSchema.nullable(),
  ticketCreated: z.boolean(),
  verdict: calculationVerdictSchema,
})

export type CalculationItem = z.infer<typeof calculationItemSchema>
export type CalculationVerdict = z.infer<typeof calculationVerdictSchema>
export type CalculationWrongReason = z.infer<
  typeof calculationWrongReasonSchema
>
export type CalculationFeedbackEntry = z.infer<
  typeof calculationFeedbackEntrySchema
>
export type CalculationFeedbackRequest = z.infer<
  typeof calculationFeedbackRequestSchema
>
export type CalculationFeedbackResponse = z.infer<
  typeof calculationFeedbackResponseSchema
>
