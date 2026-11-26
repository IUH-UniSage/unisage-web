import type { AppUser } from "@/features/users/schemas/user-schemas"
import { genderLabel } from "@/utils/display-labels"

export function getProfileFullName(me: AppUser) {
  return [me.firstName, me.lastName].filter(Boolean).join(" ") || "Người dùng"
}

export function getProfileGenderLabel(me: AppUser) {
  return me.gender ? genderLabel(me.gender) : "Chưa cập nhật"
}

export function getProfileAccessLevelLabel(me: AppUser) {
  return me.accessLevel === null || me.accessLevel === undefined
    ? "Không giới hạn"
    : `Cấp ${me.accessLevel}`
}

/** "0912345678" -> "0912 345 678", "+84912345678" -> "+84 912 345 678"; other shapes as typed. */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone?.trim()) return "Chưa cập nhật"
  const digits = phone.replace(/[^\d+]/g, "")
  const local = digits.match(/^0(\d{3})(\d{3})(\d{3})$/)
  if (local) return `0${local[1]} ${local[2]} ${local[3]}`
  const international = digits.match(/^\+84(\d{3})(\d{3})(\d{3})$/)
  if (international) {
    return `+84 ${international[1]} ${international[2]} ${international[3]}`
  }
  return phone.trim()
}
