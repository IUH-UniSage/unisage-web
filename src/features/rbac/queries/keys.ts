export const rbacKeys = {
  all: ["rbac"] as const,
  permissions: () => [...rbacKeys.all, "permissions"] as const,
  roles: () => [...rbacKeys.all, "roles"] as const,
}
