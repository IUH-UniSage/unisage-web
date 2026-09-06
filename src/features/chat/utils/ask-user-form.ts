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
  let matchToStrip: string | null = null

  for (const match of content.matchAll(JSON_FENCE_REGEX)) {
    try {
      const parsed: unknown = JSON.parse(match[1])
      const result = askUserFormSchema.safeParse(parsed)
      if (result.success) {
        form = result.data
        matchToStrip = match[0]
      }
    } catch {
      // Not valid JSON (or not this shape) - not an ask_user_form block.
    }
  }

  if (!form || !matchToStrip) {
    return { form: null, text: content }
  }

  return { form, text: content.replace(matchToStrip, "").trim() }
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
