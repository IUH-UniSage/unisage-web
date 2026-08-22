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
