export type ConfigOption = { label: string; value: string }

// Mirrors the backend's BackupFrequency enum. WEEKLY runs on Sunday, MONTHLY
// on the 1st and YEARLY on 1 January, in the app timezone.
const FREQUENCY_OPTIONS: ConfigOption[] = [
  { label: "Tắt", value: "OFF" },
  { label: "Hằng ngày", value: "DAILY" },
  { label: "Hằng tuần (Chủ nhật)", value: "WEEKLY" },
  { label: "Hằng tháng (ngày 1)", value: "MONTHLY" },
  { label: "Hằng năm (ngày 1/1)", value: "YEARLY" },
]

// Every Differential is taken against a Full, so the backend rejects OFF here.
const FULL_FREQUENCY_OPTIONS = FREQUENCY_OPTIONS.filter(
  (option) => option.value !== "OFF"
)

const TIME_STEP_MINUTES = 30

const TIME_OPTIONS: ConfigOption[] = Array.from(
  { length: (24 * 60) / TIME_STEP_MINUTES },
  (_, index) => {
    const minutes = index * TIME_STEP_MINUTES
    const value = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
    return { label: value, value }
  }
)

const OPTIONS_BY_KEY: Record<string, ConfigOption[]> = {
  "maintenance.backup.differential.frequency": FREQUENCY_OPTIONS,
  "maintenance.backup.full.frequency": FULL_FREQUENCY_OPTIONS,
  "maintenance.backup.qdrant.frequency": FREQUENCY_OPTIONS,
}

const TIME_KEYS = new Set([
  "maintenance.backup.differential.time",
  "maintenance.backup.full.time",
  "maintenance.backup.qdrant.time",
])

/**
 * The fixed choices for a STRING config that only accepts a few values, so
 * it renders as a dropdown instead of free text; null for any other config.
 * A saved value outside the list (e.g. "02:15" set through the API) is kept
 * as an extra option, so opening the page never silently changes it.
 */
export function getConfigOptions(
  configKey: string,
  currentValue: string
): ConfigOption[] | null {
  if (TIME_KEYS.has(configKey)) {
    return withCurrentValue(TIME_OPTIONS, currentValue, true)
  }
  const options = OPTIONS_BY_KEY[configKey]
  return options ? withCurrentValue(options, currentValue, false) : null
}

function withCurrentValue(
  options: ConfigOption[],
  currentValue: string,
  sorted: boolean
): ConfigOption[] {
  if (
    !currentValue ||
    options.some((option) => option.value === currentValue)
  ) {
    return options
  }
  const extended = [...options, { label: currentValue, value: currentValue }]
  return sorted
    ? extended.sort((a, b) => a.value.localeCompare(b.value))
    : extended
}
