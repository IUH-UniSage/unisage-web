import { z } from "zod"

const askUserFormOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
})

const askUserFormFieldSchema = z.object({
  field: z.string(),
  label: z.string(),
  options: z.array(askUserFormOptionSchema),
})

const askUserFormSchema = z.object({
  fields: z.array(askUserFormFieldSchema).min(1),
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
      const result = askUserFormSchema.safeParse(parsed)
      if (result.success) {
        form = result.data
        text = text.replace(match[0], "")
      }
    } catch {
      // Not valid JSON even after stripping comments (or not this shape) -
      // not an ask_user_form block.
    }
  }

  if (!form) {
    return { form: null, text: content }
  }

  return { form, text: text.trim() }
}

/**
 * Composes the plain-language reply the Clarification Guard's deterministic
 * matcher expects (it matches normalized option id/label text, not JSON) -
 * one "<field label>: <chosen option label>" line per field, in the same
 * order the form asked for them.
 */
export function formatAskUserFormAnswer(
  form: AskUserForm,
  selections: Record<string, string>
): string {
  return form.fields
    .map((field) => {
      const selectedId = selections[field.field]
      const option = field.options.find((item) => item.id === selectedId)
      return `${field.label}: ${option?.label ?? ""}`
    })
    .join(". ")
}
