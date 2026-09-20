import { Lock } from "lucide-react"

import { ToggleOptionCard } from "@/components/shared/form/toggle-option-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { SystemConfig } from "@/features/system-settings/schemas/system-config-schemas"

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

      {config.valueType === "JSON" ? (
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
