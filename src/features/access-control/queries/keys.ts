export const accessControlKeys = {
  all: ["access-control"] as const,
  permissions: () => [...accessControlKeys.all, "permissions"] as const,
  roles: () => [...accessControlKeys.all, "roles"] as const,
}
