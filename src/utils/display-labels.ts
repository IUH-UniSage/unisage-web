/**
 * Human labels for enum-like codes the backend sends verbatim (built-in role
 * names, gender). Custom role names are admin-entered and shown as-is.
 */
const BUILT_IN_ROLE_LABELS: Record<string, string> = {
  INGEST_ADMIN: "Quản trị nạp liệu",
  SUPER_ADMIN: "Quản trị hệ thống",
  USER: "Người dùng",
}

export function roleDisplayName(roleName: string): string {
  return BUILT_IN_ROLE_LABELS[roleName] ?? roleName
}

// The backend has stored both English and Vietnamese codes over time.
const GENDER_LABELS: Record<string, string> = {
  FEMALE: "Nữ",
  KHAC: "Khác",
  MALE: "Nam",
  NAM: "Nam",
  NU: "Nữ",
  NỮ: "Nữ",
  OTHER: "Khác",
}

export function genderLabel(gender: string): string {
  return GENDER_LABELS[gender.toUpperCase()] ?? gender
}
