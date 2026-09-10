import { z } from "zod"

const askUserFormOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
})

const askUserFormFieldSchema = z.object({
  field: z.string(),
  label: z.string(),
  // The agent's contract allows `options: null` for a field it expects free
  // text for (e.g. a credit count) - the product decision is to never render
  // a free-text input, only select/buttons, so such a field has nothing to
  // render controls for. Normalized to [] here so the rest of the code (and
  // AskUserFormCard) only ever deals with an array, never null/undefined.
  options: z
    .array(askUserFormOptionSchema)
    .nullable()
    .optional()
    .transform((value) => value ?? []),
})

const askUserFormSchema = z.object({
  fields: z.array(askUserFormFieldSchema).min(1),
  type: z.literal("ask_user_form"),
})

// Matches only the envelope ({ type: "ask_user_form", ... }) regardless of
// whether `fields` is present/non-empty - the model sometimes emits an empty
// `fields: []` (nothing left to ask), which is a valid signal to just not
// show a form, not an invalid block that should leak through as raw JSON.
const askUserFormEnvelopeSchema = z.object({
  type: z.literal("ask_user_form"),
})

export type AskUserFormOption = z.infer<typeof askUserFormOptionSchema>
export type AskUserFormField = z.infer<typeof askUserFormFieldSchema>
export type AskUserForm = z.infer<typeof askUserFormSchema>

const JSON_FENCE_REGEX = /```json\s*([\s\S]*?)```/g

/**
 * The model sometimes annotates a generated option with a trailing JS-style
 * `// comment` (e.g. explaining a placeholder like "Ngành 1" isn't a real
 * major) despite the prompt asking for plain JSON - invalid JSON, so
 * JSON.parse throws on it. Only ever applied as a fallback after a strict
 * parse already failed, so there's no risk to a label that legitimately
 * contains "//".
 */
function stripJsonLineComments(raw: string): string {
  return raw.replace(/\/\/.*$/gm, "")
}

function tryParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return JSON.parse(stripJsonLineComments(raw))
  }
}

/**
 * The agent's ask_user_form_guide prompt has the model end its reply with a
 * fenced ```json {"type":"ask_user_form", ...}``` block when it needs the
 * student to pick a missing value (department, training type, cohort...).
 * Finds the last such block (there should only be one), strips it out of
 * the text so MarkdownRenderer doesn't show it as a raw code block, and
 * returns the parsed form so the UI can render real controls for it instead.
 */
export function extractAskUserForm(content: string): {
  form: AskUserForm | null
  text: string
} {
  let form: AskUserForm | null = null
  let text = content

  // The model occasionally repeats the form as two fenced blocks in the same
  // reply (a malformed draft plus a clean retry) - every ask_user_form fence
  // found gets stripped from the displayed text, not just the one used to
  // render the form, so a leftover duplicate never shows up as raw JSON.
  for (const match of content.matchAll(JSON_FENCE_REGEX)) {
    try {
      const parsed = tryParseJson(match[1])
      if (!askUserFormEnvelopeSchema.safeParse(parsed).success) continue

      // It's an ask_user_form block either way - strip it from the visible
      // text, and only render actual controls if it has fields to ask about.
      text = text.replace(match[0], "")
      const result = askUserFormSchema.safeParse(parsed)
      if (result.success) form = result.data
    } catch {
      // Not valid JSON even after stripping comments - not an
      // ask_user_form block.
    }
  }

  return { form, text: text.trim() }
}

/**
 * Composes the plain-language reply the Clarification Guard's deterministic
 * matcher expects (it matches normalized option id/label text, not JSON) -
 * one "<field label>: <chosen option label>" line per answered field, in the
 * same order the form asked for them. A multi-field form can be submitted
 * partially (resolve_form keeps what's answered and re-asks the rest next
 * turn), so a field with no selection is left out entirely rather than sent
 * as an empty answer.
 */
export function formatAskUserFormAnswer(
  form: AskUserForm,
  selections: Record<string, string>
): string {
  return form.fields
    .flatMap((field) => {
      const selectedId = selections[field.field]
      const option = field.options.find((item) => item.id === selectedId)
      return option ? [`${field.label}: ${option.label}`] : []
    })
    .join(". ")
}

/**
 * The inverse of formatAskUserFormAnswer: recovers which option was picked for
 * each field from the student's reply, so a form the student already answered
 * can show its value again after a reload (the selection itself only ever
 * lived in component state, but the reply it produced is a persisted message).
 *
 * Matching is a substring test rather than splitting on the ". " join, because
 * an option label may legitimately contain ". " itself. When several options
 * of the same field match - one label being a prefix of another, e.g. "K20"
 * and "K20 (2020)" - the longest one wins, which is the only one that can be
 * the real answer. A field the reply doesn't name (a partial multi-field
 * submit) or a reply that isn't a form answer at all (the student typed their
 * own message instead) simply yields no entry, never an error.
 */
export function resolveAnsweredSelections(
  form: AskUserForm,
  answerText: string
): Record<string, string> {
  const selections: Record<string, string> = {}

  for (const field of form.fields) {
    let matched: AskUserFormOption | null = null
    for (const option of field.options) {
      if (!answerText.includes(`${field.label}: ${option.label}`)) continue
      if (!matched || option.label.length > matched.label.length) {
        matched = option
      }
    }
    if (matched) selections[field.field] = matched.id
  }

  return selections
}
