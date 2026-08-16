import type {
  AuthResponse,
  AuthSession,
} from "@/features/auth/schemas/auth-schemas"

export function createSessionFromResponse(response: AuthResponse): AuthSession {
  return {
    avatarUrl: response.avatarUrl,
    code: response.code,
    email: response.email,
    fullName: response.fullName,
    isSystemRole: response.isSystemRole,
    permissions: response.permissions,
    role: response.role,
    userId: response.userId,
  }
}

export function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean)

  return words
    .slice(-2)
    .map((word) => word[0]?.toLocaleUpperCase("vi") ?? "")
    .join("")
}
