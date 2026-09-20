import { formatDateTime } from "@/utils/date"

// Backend field names are raw Java property names (camelCase) shared across
// many entities - this dictionary covers the ones actually seen across the
// audited entities/domain events; anything missing falls back to a
// decamelized label (see labelFor) rather than showing the raw key.
const FIELD_LABELS: Record<string, string> = {
  attemptedCode: "Mã đã nhập",
  code: "Mã",
  content: "Nội dung",
  createdAt: "Tạo lúc",
  createdBy: "Người tạo",
  description: "Mô tả",
  email: "Email",
  fullName: "Họ tên",
  isActive: "Đang hoạt động",
  lastLogin: "Lần đăng nhập cuối",
  name: "Tên",
  phone: "Số điện thoại",
  reason: "Lý do",
  role: "Vai trò",
  status: "Trạng thái",
  updatedAt: "Cập nhật lúc",
  updatedBy: "Người cập nhật",
}

const REASON_LABELS: Record<string, string> = {
  BAD_PASSWORD: "Sai mật khẩu",
  CODE_NOT_FOUND: "Không tìm thấy mã người dùng",
}

const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/

function labelFor(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key]
  // camelCase -> "Camel case" as a readable fallback for fields not in the
  // dictionary above, instead of showing the raw Java property name.
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

function formatScalar(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "(trống)"
  if (typeof value === "boolean") return value ? "Có" : "Không"
  if (typeof value === "string") {
    if (key === "reason") return REASON_LABELS[value] ?? value
    if (ISO_DATETIME_PATTERN.test(value)) return formatDateTime(value)
    return value
  }
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export type AuditDetailRow =
  | {
      key: string
      kind: "diff"
      label: string
      newValue: string
      oldValue: string
    }
  | { key: string; kind: "value"; label: string; value: string }

function isDiffShape(value: unknown): value is { new: unknown; old: unknown } {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "old" in value &&
    "new" in value
  )
}

/**
 * `AuditLog.details` is a JSON-encoded string, not a nested object - the
 * backend's `AuditEventListener` writes CREATE/DOWNLOAD/VIEW as flat
 * `{field: value}` and UPDATE as `{field: {old, new}}`. Parses it into rows a
 * human can actually read instead of showing the raw JSON. Returns null when
 * `details` is empty or isn't the expected shape (caller falls back to the
 * raw string so nothing is silently hidden).
 */
export function parseAuditDetails(
  details: string | null | undefined
): AuditDetailRow[] | null {
  if (!details) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(details)
  } catch {
    return null
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null
  }

  const rows: AuditDetailRow[] = []
  for (const [key, value] of Object.entries(
    parsed as Record<string, unknown>
  )) {
    // Internal bookkeeping for when resourceType falls back to OTHER - not
    // meant for display; the dialog already shows resourceType/resourceId.
    if (key === "_entity") continue

    if (isDiffShape(value)) {
      rows.push({
        key,
        kind: "diff",
        label: labelFor(key),
        newValue: formatScalar(key, value.new),
        oldValue: formatScalar(key, value.old),
      })
    } else {
      rows.push({
        key,
        kind: "value",
        label: labelFor(key),
        value: formatScalar(key, value),
      })
    }
  }
  return rows
}

export function summarizeAuditDetails(
  details: string | null | undefined
): string {
  const rows = parseAuditDetails(details)
  if (rows === null) return details || "—"
  if (rows.length === 0) return "—"
  return rows
    .map((row) =>
      row.kind === "diff"
        ? `${row.label}: ${row.oldValue} → ${row.newValue}`
        : `${row.label}: ${row.value}`
    )
    .join(", ")
}
