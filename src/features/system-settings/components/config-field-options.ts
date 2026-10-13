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

// The formats unisage-agent's ingestion parser can read (parser.py: txt,
// html/htm, and pdf/docx through PyMuPDF). Anything else would upload fine
// and then fail at ingestion, so the list is closed rather than free text.
const FILE_EXTENSION_OPTIONS: ConfigOption[] = [
  { label: ".pdf (PDF)", value: ".pdf" },
  { label: ".docx (Word)", value: ".docx" },
  { label: ".txt (Văn bản thuần)", value: ".txt" },
  { label: ".html (Trang web)", value: ".html" },
  { label: ".htm (Trang web)", value: ".htm" },
]

const MULTI_OPTIONS_BY_KEY: Record<string, ConfigOption[]> = {
  "ingest.allowed_file_extensions": FILE_EXTENSION_OPTIONS,
}

/**
 * The fixed choices for a JSON string-array config whose items come from a
 * closed list, so it renders as a multi-select dropdown; null otherwise.
 * Saved items outside the list stay selectable so they can be unticked.
 */
export function getConfigMultiOptions(
  configKey: string,
  currentItems: string[]
): ConfigOption[] | null {
  const options = MULTI_OPTIONS_BY_KEY[configKey]
  if (!options) {
    return null
  }
  const extras = currentItems
    .filter((item) => !options.some((option) => option.value === item))
    .map((item) => ({ label: item, value: item }))
  return [...options, ...extras]
}
