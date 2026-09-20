import { Save } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Button } from "@/components/ui/button"
import { ConfigField } from "@/features/system-settings/components/config-field"
import type { ConfigGroup } from "@/features/system-settings/components/ingest-config-groups"
import { useUpdateSystemConfigMutation } from "@/features/system-settings/queries/use-mutations"
import type { SystemConfig } from "@/features/system-settings/schemas/system-config-schemas"
import { getErrorMessage } from "@/utils/error-handler"

const NUMBER_ERROR = "Giá trị phải là một số hợp lệ."
const JSON_ERROR = "Giá trị phải là JSON hợp lệ."

function validateValue(config: SystemConfig, value: string): string | null {
  if (config.valueType === "NUMBER") {
    const trimmed = value.trim()
    return trimmed !== "" && !Number.isNaN(Number(trimmed))
      ? null
      : NUMBER_ERROR
  }

  if (config.valueType === "JSON") {
    try {
      JSON.parse(value)
      return null
    } catch {
      return JSON_ERROR
    }
  }

  return null
}

function initialValues(configs: SystemConfig[]): Record<string, string> {
  return Object.fromEntries(
    configs.map((config) => [config.configKey, config.value])
  )
}

type CategoryConfigFormProps = {
  canUpdate: boolean
  configs: SystemConfig[]
  // Optional visual grouping into cards (e.g. INGEST's per-chunking-strategy
  // breakdown) - `configs` must still be the same rows flattened, since
  // dirty-tracking/save always operates on the whole tab in one go regardless
  // of how it's grouped visually.
  groups?: ConfigGroup[]
}

// One form per category tab - not a table, per UNISAGE-65's brief (this is a
// settings page, not row-of-records CRUD). Local draft/baseline state is
// seeded once from the initial `configs` prop and never resynced from a
// later prop change (e.g. a background refetch) - only this form's own
// successful saves update the baseline, via the mutation's onSuccess +
// this component's own state update below. That keeps an admin's in-progress
// edits in one field from being clobbered by an unrelated refetch, at the
// cost of not picking up a concurrent edit from someone else mid-session -
// an acceptable trade for a small internal admin tool.
export function CategoryConfigForm({
  canUpdate,
  configs,
  groups,
}: CategoryConfigFormProps) {
  const [baseline, setBaseline] = useState(() => initialValues(configs))
  const [draft, setDraft] = useState(() => initialValues(configs))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const updateMutation = useUpdateSystemConfigMutation()

  if (configs.length === 0) {
    return (
      <SearchEmpty
        description="Chưa có cấu hình nào được thiết lập cho danh mục này."
        title="Không có cấu hình"
      />
    )
  }

  const dirtyKeys = configs
    .filter((config) => draft[config.configKey] !== baseline[config.configKey])
    .map((config) => config.configKey)
  const isDirty = dirtyKeys.length > 0

  const handleChange = (configKey: string, value: string) => {
    setDraft((current) => ({ ...current, [configKey]: value }))
    setFieldErrors((current) => {
      if (!(configKey in current)) return current
      const next = { ...current }
      delete next[configKey]
      return next
    })
  }

  const handleSave = async () => {
    const targets = configs.filter((config) =>
      dirtyKeys.includes(config.configKey)
    )
    const validationErrors: Record<string, string> = {}
    for (const config of targets) {
      const error = validateValue(config, draft[config.configKey])
      if (error) validationErrors[config.configKey] = error
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...validationErrors }))
      return
    }

    setIsSaving(true)
    const results = await Promise.allSettled(
      targets.map((config) =>
        updateMutation.mutateAsync({
          configKey: config.configKey,
          input: { value: draft[config.configKey] },
        })
      )
    )
    setIsSaving(false)

    const nextErrors: Record<string, string> = {}
    const savedValues: Record<string, string> = {}
    results.forEach((result, index) => {
      const configKey = targets[index].configKey
      if (result.status === "fulfilled") {
        savedValues[configKey] = result.value.value
      } else {
        nextErrors[configKey] = getErrorMessage(result.reason)
      }
    })

    if (Object.keys(savedValues).length > 0) {
      setBaseline((current) => ({ ...current, ...savedValues }))
      setDraft((current) => ({ ...current, ...savedValues }))
    }
    setFieldErrors((current) => ({ ...current, ...nextErrors }))

    const savedCount = Object.keys(savedValues).length
    const failedCount = Object.keys(nextErrors).length
    if (savedCount > 0) {
      toast.success(`Đã lưu ${savedCount} thay đổi.`)
    }
    if (failedCount > 0) {
      toast.error(`Không thể lưu ${failedCount} thay đổi. Vui lòng thử lại.`)
    }
  }

  const renderField = (config: SystemConfig) => (
    <ConfigField
      config={config}
      error={fieldErrors[config.configKey]}
      key={config.configKey}
      onChange={(value) => handleChange(config.configKey, value)}
      value={draft[config.configKey]}
    />
  )

  return (
    <div className="space-y-4">
      {groups ? (
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              className="space-y-3 rounded-xl border bg-card p-4 shadow-xs"
              key={group.title}
            >
              <h3 className="text-xs font-black tracking-widest text-muted-foreground uppercase">
                {group.title}
              </h3>
              <div className="space-y-3">{group.configs.map(renderField)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">{configs.map(renderField)}</div>
      )}

      {canUpdate ? (
        <div className="flex justify-end">
          <Button disabled={!isDirty || isSaving} onClick={handleSave}>
            <Save aria-hidden="true" />
            Lưu thay đổi
          </Button>
        </div>
      ) : null}
    </div>
  )
}
