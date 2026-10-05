export type DateInput = Date | number | string | null | undefined

/** Every date/time the UI shows is Vietnam time, whatever the viewer's device is set to. */
export const APP_TIME_ZONE = "Asia/Ho_Chi_Minh"

// "2026-10-05T06:02:00" / "2026-10-05T06:02:00.123456" - a date-time with no offset.
const OFFSETLESS_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/

/**
 * Parses an API timestamp. Both backends store and send UTC; an offset-less
 * date-time (rows written before unisage-backend started appending "Z") is
 * read as UTC too - `new Date()` alone would read it as the device's local
 * time and shift it by the device's UTC offset.
 */
export function parseApiDate(input: DateInput): Date | null {
  if (input === null || input === undefined || input === "") return null

  const date =
    input instanceof Date
      ? input
      : new Date(
          typeof input === "string" && OFFSETLESS_DATE_TIME.test(input)
            ? `${input}Z`
            : input
        )
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
  const date = parseApiDate(input)
  return date
    ? new Intl.DateTimeFormat(locale, {
        timeZone: APP_TIME_ZONE,
        ...options,
      }).format(date)
    : "-"
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
  const date = parseApiDate(input)
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
