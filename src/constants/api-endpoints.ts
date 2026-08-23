export const API_ENDPOINTS = {
  categories: {
    categories: "/categories",
    category: (categoryId: string) => `/categories/${categoryId}`,
  },
  departments: {
    department: (departmentId: string) => `/departments/${departmentId}`,
    departmentRecover: (departmentId: string) =>
      `/departments/${departmentId}/recover`,
    departments: "/departments",
    departmentsRoots: "/departments/roots",
  },
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
  users: {
    user: (userId: string) => `/users/${userId}`,
    userRecover: (userId: string) => `/users/${userId}/recover`,
    users: "/users",
    usersBulkDelete: "/users/bulk",
    usersBulkRecover: "/users/bulk/recover",
  },
} as const
