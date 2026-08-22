export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  rbac: {
    roles: "/rbac/roles",
    role: (roleId: string) => `/rbac/roles/${roleId}`,
    roleRecover: (roleId: string) => `/rbac/roles/${roleId}/recover`,
    permissions: "/rbac/permissions",
  },
} as const
