// Answers typed into an open panel, kept in sessionStorage per `panel_id` so a
// reload doesn't lose them. A convenience only - never the source of truth -
// so every storage access is guarded: a browser that blocks storage (private
// mode, disabled site data) just loses the draft, the panel keeps working.

const KEY_PREFIX = "unisage.clarification-draft."

function draftKey(panelId: string): string {
  return `${KEY_PREFIX}${panelId}`
}

export function readClarificationDraft(panelId: string): unknown {
  try {
    const raw = window.sessionStorage.getItem(draftKey(panelId))
    return raw ? (JSON.parse(raw) as unknown) : null
  } catch {
    return null
  }
}

export function writeClarificationDraft(panelId: string, draft: unknown) {
  try {
    window.sessionStorage.setItem(draftKey(panelId), JSON.stringify(draft))
  } catch {
    // Storage unavailable or full - the draft lives in component state only.
  }
}

export function clearClarificationDraft(panelId: string) {
  try {
    window.sessionStorage.removeItem(draftKey(panelId))
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
