import { Lock, X } from "lucide-react"
import { useState } from "react"

import { ToggleOptionCard } from "@/components/shared/form/toggle-option-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { SystemConfig } from "@/features/system-settings/schemas/system-config-schemas"

/** Parses `value` as a JSON array of strings, or returns null if it isn't one. */
function parseStringArray(value: string): string[] | null {
  try {
    const parsed: unknown = JSON.parse(value)
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "string")
    ) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

// Typing raw JSON (`[".txt",".pdf",...]`) by hand is unpleasant and error
// prone - whenever a JSON config's value is a flat array of strings, edit it
// as removable chips + an "add" input instead. Falls back to the raw
// Textarea below for any other JSON shape (objects, nested arrays, or
// currently-invalid JSON an admin is mid-edit on).
function StringArrayField({
  disabled,
  fieldId,
  items,
  onChange,
}: {
  disabled: boolean
  fieldId: string
  items: string[]
  onChange: (items: string[]) => void
}) {
  const [draft, setDraft] = useState("")

  const commitDraft = () => {
    const next = draft.trim()
    if (next && !items.includes(next)) {
      onChange([...items, next])
    }
    setDraft("")
  }

  return (
    <div className="space-y-2">
      <div className="flex min-h-9 flex-wrap gap-1.5 rounded-xl border bg-white p-2">
        {items.map((item) => (
          <Badge className="gap-1 font-mono" key={item} variant="secondary">
            {item}
            {disabled ? null : (
              <button
                aria-label={`Xóa ${item}`}
                onClick={() => onChange(items.filter((i) => i !== item))}
                type="button"
              >
                <X className="size-3" />
              </button>
            )}
          </Badge>
        ))}
        {disabled ? null : (
          <input
            className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={disabled}
            id={fieldId}
            onBlur={commitDraft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault()
                commitDraft()
              } else if (
                event.key === "Backspace" &&
                draft === "" &&
                items.length > 0
              ) {
                onChange(items.slice(0, -1))
              }
            }}
            placeholder="Nhập giá trị rồi nhấn Enter..."
            value={draft}
          />
        )}
      </div>
    </div>
  )
}

type ConfigFieldProps = {
  config: SystemConfig
  error?: string
  onChange: (value: string) => void
  value: string
}

// Renders one config row's field, shaped by its `valueType` - STRING/NUMBER
// get a plain Input, BOOLEAN reuses ToggleOptionCard (bordered
// checkbox+label+description row, same as rbac's "Kích hoạt vai trò"), JSON
// gets a raw-text Textarea. `label`/`description` always come from the
// backend row (Vietnamese copy) - never hardcoded here. `isEditable: false`
// renders the field disabled but still visible, per the backend contract
// (none of the 11 seeded rows currently set this, but the field exists).
export function ConfigField({
  config,
  error,
  onChange,
  value,
}: ConfigFieldProps) {
  const disabled = !config.isEditable
  const fieldId = `system-config-${config.configKey}`
  const stringArrayItems =
    config.valueType === "JSON" ? parseStringArray(value) : null

  if (config.valueType === "BOOLEAN") {
    return (
      <div className="space-y-1.5">
        <ToggleOptionCard
          checked={value === "true"}
          description={config.description ?? ""}
          label={config.label}
          onCheckedChange={(checked) =>
            !disabled && onChange(checked ? "true" : "false")
          }
        />
        {disabled ? <ReadOnlyBadge /> : null}
      </div>
    )
  }

  return (
    <div className="space-y-1.5 rounded-xl border p-3">
      <div className="flex items-start justify-between gap-2">
        <Label className="text-sm font-medium" htmlFor={fieldId}>
          {config.label}
        </Label>
        {disabled ? <ReadOnlyBadge /> : null}
      </div>

      {stringArrayItems !== null ? (
        <StringArrayField
          disabled={disabled}
          fieldId={fieldId}
          items={stringArrayItems}
          onChange={(items) => onChange(JSON.stringify(items))}
        />
      ) : config.valueType === "JSON" ? (
        <Textarea
          aria-invalid={Boolean(error)}
          className="font-mono text-xs"
          disabled={disabled}
          id={fieldId}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          value={value}
        />
      ) : (
        <Input
          aria-invalid={Boolean(error)}
          disabled={disabled}
          id={fieldId}
          onChange={(event) => onChange(event.target.value)}
          type={config.valueType === "NUMBER" ? "number" : "text"}
          value={value}
        />
      )}

      {config.description ? (
        <p className="text-xs leading-5 text-muted-foreground">
          {config.description}
        </p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

function ReadOnlyBadge() {
  return (
    <Badge className="shrink-0" variant="outline">
      <Lock aria-hidden="true" />
      Chỉ đọc
    </Badge>
  )
}
