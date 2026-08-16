import type {
  AuthResponse,
  AuthSession,
  SelectProfileResponse,
  UserProfile,
} from "@/features/auth/schemas/auth-schemas"

export function createSessionFromLogin(
  response: AuthResponse,
  profile: UserProfile
): AuthSession {
  return {
    avatarUrl: profile.avatarUrl,
    code: response.code,
    email: response.email,
    fullName: profile.fullName,
    isSystemRole: profile.isSystemRole,
    permissions: profile.permissions,
    role: profile.role,
    userId: profile.userId,
  }
}

export function createSessionFromSelectedProfile(
  response: SelectProfileResponse,
  userId: string
): AuthSession {
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
