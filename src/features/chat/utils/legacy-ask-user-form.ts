import { z } from "zod"

// Read-only support for replies written before the clarification panel
// (contract §6): the agent used to end a reply with a fenced
// ```json {"type":"ask_user_form", ...}``` block. New replies never carry it,
// but old history still does - it is stripped from the text so no raw JSON
// shows, and listed read-only. It never opens the panel.

const legacyOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
})

const legacyFieldSchema = z.object({
  field: z.string(),
  label: z.string(),
  options: z
    .array(legacyOptionSchema)
    .nullable()
    .optional()
    .transform((value) => value ?? []),
})

const legacyFormSchema = z.object({
  fields: z.array(legacyFieldSchema).min(1),
  type: z.literal("ask_user_form"),
})

// The envelope alone: an empty `fields: []` is still a form block to strip.
const legacyEnvelopeSchema = z.object({
  type: z.literal("ask_user_form"),
})

export type LegacyAskUserForm = z.infer<typeof legacyFormSchema>

const JSON_FENCE_REGEX = /```json\s*([\s\S]*?)```/g

// The model sometimes annotated an option with a trailing `// comment`
// (invalid JSON); only tried after a strict parse already failed.
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
 * Removes every legacy ask_user_form fence from `content` and returns the
 * last parseable form (for the read-only block) alongside the cleaned text.
 */
export function stripLegacyAskUserForm(content: string): {
  form: LegacyAskUserForm | null
  text: string
} {
  let form: LegacyAskUserForm | null = null
  let text = content

  for (const match of content.matchAll(JSON_FENCE_REGEX)) {
    try {
      const parsed = tryParseJson(match[1])
      if (!legacyEnvelopeSchema.safeParse(parsed).success) continue

      text = text.replace(match[0], "")
      const result = legacyFormSchema.safeParse(parsed)
      if (result.success) form = result.data
    } catch {
      // Not JSON even without comments - not a form block, left as-is.
    }
  }

  return { form, text: text.trim() }
}
