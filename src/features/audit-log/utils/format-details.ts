import { formatDateTime } from "@/utils/date"

// Backend field names are raw Java property names (camelCase) shared across
// many entities - this dictionary covers the ones actually seen across the
// audited entities/domain events; anything missing falls back to a
// decamelized label (see labelFor) rather than showing the raw key.
const FIELD_LABELS: Record<string, string> = {
  attemptedCode: "Mã đã nhập",
  category: "Danh mục",
  code: "Mã",
  content: "Nội dung",
  deletedAt: "Ngày xóa",
  description: "Mô tả",
  email: "Email",
  fileType: "Loại tệp",
  firstName: "Tên",
  fullName: "Họ tên",
  isActive: "Đang hoạt động",
  isPublic: "Công khai",
  label: "Nhãn",
  lastLogin: "Lần đăng nhập cuối",
  lastName: "Họ",
  name: "Tên",
  phone: "Số điện thoại",
  reason: "Lý do",
  role: "Vai trò",
  sourceUrl: "Tệp nguồn",
  status: "Trạng thái",
  title: "Tiêu đề",
  value: "Giá trị",
}

// Bookkeeping the backend stops writing since UNISAGE-92 - still hidden here
// so rows logged before that read the same way. "_"-prefixed keys (_entity,
// _label) are internal metadata, never a field of the object.
const HIDDEN_FIELDS = new Set([
  "createdAt",
  "createdBy",
  "updatedAt",
  "updatedBy",
  "version",
])

// Same order as AuditEventListener.LABEL_FIELDS - lets CREATE/DELETE rows
// logged before `_label` existed still show which object they were about.
const LABEL_FIELDS = [
  "_label",
  "title",
  "name",
  "label",
  "code",
  "llmModelName",
  "configKey",
  "email",
]

const REASON_LABELS: Record<string, string> = {
  BAD_PASSWORD: "Sai mật khẩu",
  CODE_NOT_FOUND: "Không tìm thấy mã người dùng",
}

const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/

// Association fields (category, minAccessLevel, updatedBy…) are recorded as
// the related row's id - meaningless to a reader, so only the field name is
// shown for them.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isOpaqueId(value: unknown): boolean {
  return typeof value === "string" && UUID_PATTERN.test(value)
}

function labelFor(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key]
  // camelCase -> "Camel case" as a readable fallback for fields not in the
  // dictionary above, instead of showing the raw Java property name.
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === ""
}

function formatScalar(key: string, value: unknown): string {
  if (isEmptyValue(value)) return "(không có)"
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
      // "added": was empty, now set; "cleared": was set, now empty - shown
      // as "Thêm X: …" / "Bỏ trống X" instead of "(trống) → …" (UNISAGE-92).
      change: "added" | "changed" | "cleared"
      kind: "diff"
      label: string
      // Values are related-row ids - show only that the field changed.
      opaque: boolean
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

function parseDetailsObject(
  details: string | null | undefined
): Record<string, unknown> | null {
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
  return parsed as Record<string, unknown>
}

/**
 * Name of the object a CREATE/DELETE row is about (e.g. a document title).
 * Creating/deleting acts on the whole object, so the list shows just this
 * instead of every field it had (UNISAGE-92).
 */
export function getAuditObjectLabel(
  details: string | null | undefined
): string | null {
  const parsed = parseDetailsObject(details)
  if (!parsed) return null
  for (const key of LABEL_FIELDS) {
    const value = parsed[key]
    if (typeof value === "string" && value.trim()) return value
  }
  return null
}

/**
 * `AuditLog.details` is a JSON-encoded string, not a nested object - the
 * backend's `AuditEventListener` writes UPDATE as `{field: {old, new}}`;
 * auth events (e.g. LOGIN_FAILED) write flat `{field: value}`. Parses it into rows a
 * human can actually read instead of showing the raw JSON. Returns null when
 * `details` is empty or isn't the expected shape (caller falls back to the
 * raw string so nothing is silently hidden).
 */
export function parseAuditDetails(
  details: string | null | undefined
): AuditDetailRow[] | null {
  const parsed = parseDetailsObject(details)
  if (!parsed) return null

  const rows: AuditDetailRow[] = []
  for (const [key, value] of Object.entries(parsed)) {
    if (key.startsWith("_") || HIDDEN_FIELDS.has(key)) continue

    if (isDiffShape(value)) {
      rows.push({
        change: isEmptyValue(value.old)
          ? "added"
          : isEmptyValue(value.new)
            ? "cleared"
            : "changed",
        key,
        kind: "diff",
        label: labelFor(key),
        opaque: isOpaqueId(value.old) || isOpaqueId(value.new),
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

/** One row as a short phrase, e.g. "Trạng thái: A → B" or "Thêm Mô tả: X". */
export function formatAuditRow(row: AuditDetailRow): string {
  if (row.kind === "value") return `${row.label}: ${row.value}`
  // Setting deletedAt is a soft delete (logged as UPDATE before UNISAGE-92);
  // clearing it is how the row comes back.
  if (row.key === "deletedAt" && row.change === "added") return "Đã xóa"
  if (row.key === "deletedAt" && row.change === "cleared") return "Khôi phục"
  if (row.opaque) {
    const verb = { added: "Thêm", changed: "Đổi", cleared: "Bỏ trống" }
    return `${verb[row.change]} ${row.label}`
  }
  switch (row.change) {
    case "added":
      return `Thêm ${row.label}: ${row.newValue}`
    case "cleared":
      return `Bỏ trống ${row.label}`
    case "changed":
      return `${row.label}: ${row.oldValue} → ${row.newValue}`
  }
}

export function summarizeAuditDetails(
  details: string | null | undefined
): string {
  const rows = parseAuditDetails(details)
  if (rows === null) return details || "—"
  if (rows.length === 0) return "—"
  return rows.map(formatAuditRow).join(", ")
}
