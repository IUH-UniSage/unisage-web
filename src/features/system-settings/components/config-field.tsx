import { Lock, X } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getConfigOptions } from "@/features/system-settings/components/config-field-options"
import type { SystemConfig } from "@/features/system-settings/schemas/system-config-schemas"
import { cn } from "@/lib/utils"

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
  isDirty?: boolean
  onChange: (value: string) => void
  value: string
}

// One settings row: label + description on the left, a compact control on
// the right, stacked on narrow screens. The control follows `valueType` -
// STRING/NUMBER get an Input (a Select when the key has fixed choices, see
// config-field-options.ts), BOOLEAN a checkbox, JSON the chip editor or a
// raw Textarea; the last two take the full row width since their content is
// long. `label`/`description` always come from the backend row (Vietnamese
// copy) - never hardcoded here. `isEditable: false` renders the control
// disabled but still visible, per the backend contract.
export function ConfigField({
  config,
  error,
  isDirty = false,
  onChange,
  value,
}: ConfigFieldProps) {
  const disabled = !config.isEditable
  const fieldId = `system-config-${config.configKey}`
  const stringArrayItems =
    config.valueType === "JSON" ? parseStringArray(value) : null
  const options =
    config.valueType === "STRING"
      ? getConfigOptions(config.configKey, value)
      : null
  const isWide = config.valueType === "JSON"

  return (
    <div
      className={cn(
        "grid gap-x-8 gap-y-3 py-4",
        !isWide && "sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-center"
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-sm font-semibold" htmlFor={fieldId}>
            {config.label}
          </Label>
          {isDirty ? (
            <Badge className="h-5 px-1.5 text-[11px]" variant="secondary">
              Chưa lưu
            </Badge>
          ) : null}
          {disabled ? <ReadOnlyBadge /> : null}
        </div>
        {config.description ? (
          <p className="max-w-prose text-[13px] leading-5 text-muted-foreground">
            {config.description}
          </p>
        ) : null}
      </div>

      <div className="min-w-0 space-y-1.5">
        {config.valueType === "BOOLEAN" ? (
          <label
            className="flex h-9 cursor-pointer items-center gap-2.5 text-sm sm:justify-end"
            htmlFor={fieldId}
          >
            <span
              className={cn(
                value === "true" ? "font-medium" : "text-muted-foreground"
              )}
            >
              {value === "true" ? "Đang bật" : "Đang tắt"}
            </span>
            <Checkbox
              checked={value === "true"}
              disabled={disabled}
              id={fieldId}
              onCheckedChange={(checked) =>
                onChange(checked === true ? "true" : "false")
              }
            />
          </label>
        ) : options !== null ? (
          <Select disabled={disabled} onValueChange={onChange} value={value}>
            <SelectTrigger
              aria-invalid={Boolean(error)}
              className="w-full"
              id={fieldId}
            >
              <SelectValue placeholder="Chọn giá trị" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : stringArrayItems !== null ? (
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
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
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
