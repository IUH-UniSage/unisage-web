import { ROUTES } from "@/constants/paths"

export const USER_ROLES = {
  ingestAdmin: "INGEST_ADMIN",
  superAdmin: "SUPER_ADMIN",
  user: "USER",
} as const

export type KnownUserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export function getRoleHome(role: string): string {
  switch (role) {
    case USER_ROLES.superAdmin:
      return ROUTES.admin
    case USER_ROLES.ingestAdmin:
      return ROUTES.ingester
    default:
      return ROUTES.home
  }
}

/**
 * The page `PrivateRoute` was sending the user to (`location.state.from`), if it
 * is an internal path: starts with "/" but not "//" or "/\\" (protocol-relative
 * URLs that would leave the app - no open redirect).
 */
export function readReturnPath(state: unknown): string | null {
  if (!state || typeof state !== "object" || !("from" in state)) return null
  const { from } = state
  if (typeof from !== "string" || !from.startsWith("/")) return null
  if (from.startsWith("//") || from.startsWith("/\\")) return null
  return from
}

/** Where to land after signing in: back to `from`, else the role's home. */
export function getPostSignInPath(state: unknown, role: string): string {
  return readReturnPath(state) ?? getRoleHome(role)
}
