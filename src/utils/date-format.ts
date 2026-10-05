import { formatDate } from "@/utils/date"

export function formatAuditDate(value: string | null | undefined) {
  if (!value) return "Chưa có"

  const formatted = formatDate(value)
  return formatted === "-" ? value : formatted
}
