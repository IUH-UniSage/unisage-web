export type DateInput = Date | number | string | null | undefined

function toDate(input: DateInput): Date | null {
  if (input === null || input === undefined || input === "") return null

  const date = input instanceof Date ? input : new Date(input)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(
  input: DateInput,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  },
  locale = "vi-VN"
): string {
  const date = toDate(input)
  return date ? new Intl.DateTimeFormat(locale, options).format(date) : "-"
}

export function formatDateTime(input: DateInput, locale = "vi-VN"): string {
  return formatDate(
    input,
    {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
    locale
  )
}

export function formatRelativeTime(input: DateInput, locale = "vi"): string {
  const date = toDate(input)
  if (!date) return "-"

  const elapsedSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ]

  const [unit, seconds] = units.find(
    ([, unitSeconds]) => Math.abs(elapsedSeconds) >= unitSeconds
  ) ?? ["second", 1]

  return formatter.format(Math.round(elapsedSeconds / seconds), unit)
}
