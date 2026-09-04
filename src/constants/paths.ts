export const ROUTE_SEGMENTS = {
  accessLevels: "access-levels",
  auth: "auth",
  categories: "categories",
  chat: "chat",
  departments: "departments",
  documents: "documents",
  health: "health",
  knowledge: "knowledge",
  login: "login",
  logs: "logs",
  models: "models",
  notifications: "notifications",
  profile: "profile",
  processing: "processing",
  quality: "quality",
  rbac: "rbac",
  settings: "settings",
  tickets: "tickets",
  users: "users",
} as const

export const ROUTES = {
  admin: "/admin",
  adminAccessLevels: "/admin/access-levels",
  adminCategories: "/admin/categories",
  adminDepartments: "/admin/departments",
  adminDocuments: "/admin/documents",
  adminHealth: "/admin/health",
  adminLogs: "/admin/logs",
  adminModels: "/admin/models",
  adminRbac: "/admin/rbac",
  adminSettings: "/admin/settings",
  adminUsers: "/admin/users",
  chat: "/chat",
  home: "/",
  ingester: "/ingester",
  ingesterDocuments: "/ingester/documents",
  ingesterProcessing: "/ingester/processing",
  ingesterQuality: "/ingester/quality",
  ingesterSettings: "/ingester/settings",
  knowledge: "/knowledge",
  legacySignIn: "/auth/login",
  login: "/login",
  notifications: "/notifications",
  profile: "/profile",
  signIn: "/login",
  tickets: "/tickets",
} as const

export type RouteKey = keyof typeof ROUTES

export function ingesterIngestWizardPath(documentId: string): string {
  return `${ROUTES.ingesterProcessing}/${documentId}`
}

export function adminDocumentIngestWizardPath(documentId: string): string {
  return `${ROUTES.adminDocuments}/${documentId}/ingest`
}

export function adminUserNewPath(): string {
  return `${ROUTES.adminUsers}/new`
}

export function adminUserDetailPath(userId: string): string {
  return `${ROUTES.adminUsers}/${userId}`
}

export function adminUserEditPath(userId: string): string {
  return `${ROUTES.adminUsers}/${userId}/edit`
}

export function adminRoleNewPath(): string {
  return `${ROUTES.adminRbac}/new`
}

export function adminRoleDetailPath(roleId: string): string {
  return `${ROUTES.adminRbac}/${roleId}`
}

export function adminRoleEditPath(roleId: string): string {
  return `${ROUTES.adminRbac}/${roleId}/edit`
}

export function adminDocumentNewPath(): string {
  return `${ROUTES.adminDocuments}/new`
}

export function adminDocumentDetailPath(documentId: string): string {
  return `${ROUTES.adminDocuments}/${documentId}`
}

export function adminDocumentEditPath(documentId: string): string {
  return `${ROUTES.adminDocuments}/${documentId}/edit`
}

export function ingesterDocumentNewPath(): string {
  return `${ROUTES.ingesterDocuments}/new`
}

export function ingesterDocumentDetailPath(documentId: string): string {
  return `${ROUTES.ingesterDocuments}/${documentId}`
}

export function ingesterDocumentEditPath(documentId: string): string {
  return `${ROUTES.ingesterDocuments}/${documentId}/edit`
}
