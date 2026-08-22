export const API_ENDPOINTS = {
  accessLevels: {
    accessLevel: (accessLevelId: string) => `/access-levels/${accessLevelId}`,
    accessLevels: "/access-levels",
  },
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  rbac: {
    roles: "/rbac/roles",
    role: (roleId: string) => `/rbac/roles/${roleId}`,
    roleRecover: (roleId: string) => `/rbac/roles/${roleId}/recover`,
    rolesBulkDelete: "/rbac/roles/bulk",
    rolesBulkRecover: "/rbac/roles/bulk/recover",
    permissions: "/rbac/permissions",
    permission: (permissionId: string) => `/rbac/permissions/${permissionId}`,
    permissionRecover: (permissionId: string) =>
      `/rbac/permissions/${permissionId}/recover`,
    permissionsBulkDelete: "/rbac/permissions/bulk",
    permissionsBulkRecover: "/rbac/permissions/bulk/recover",
  },
} as const
