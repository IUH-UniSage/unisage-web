import type { AppUser } from "@/features/users/schemas/user-schemas"

const GENDER_LABELS: Record<string, string> = {
  FEMALE: "Nữ",
  MALE: "Nam",
  OTHER: "Khác",
}

export function getProfileFullName(me: AppUser) {
  return [me.firstName, me.lastName].filter(Boolean).join(" ") || "Người dùng"
}

export function getProfileGenderLabel(me: AppUser) {
  return (me.gender && GENDER_LABELS[me.gender]) || me.gender || "Chưa cập nhật"
}

export function getProfileAccessLevelLabel(me: AppUser) {
  return me.accessLevel === null || me.accessLevel === undefined
    ? "Không giới hạn"
    : `Cấp ${me.accessLevel}`
}
