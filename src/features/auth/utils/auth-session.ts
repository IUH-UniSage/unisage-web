import type {
  AuthResponse,
  AuthSession,
} from "@/features/auth/schemas/auth-schemas"
import { getJwtSubject } from "@/features/auth/utils/jwt"

export function createSessionFromResponse(response: AuthResponse): AuthSession {
  const userId = getJwtSubject(response.accessToken)
  if (!userId) {
    throw new Error("Access token is missing a subject claim.")
  }

  return {
    avatarUrl: response.avatarUrl,
    code: response.code,
    email: response.email,
    fullName: response.fullName,
    isSystemRole: response.isSystemRole,
    permissions: response.permissions,
    role: response.role,
    userId,
  }
}

export function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean)

  return words
    .slice(-2)
    .map((word) => word[0]?.toLocaleUpperCase("vi") ?? "")
    .join("")
}
