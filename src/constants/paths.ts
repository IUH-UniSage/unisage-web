export const ROUTE_SEGMENTS = {
  accessLevels: "access-levels",
  auth: "auth",
  backups: "backups",
  categories: "categories",
  chat: "chat",
  chatConversation: ":conversationId",
  costManagement: "cost-management",
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
  usageLimits: "usage-limits",
  users: "users",
} as const

export const ROUTES = {
  admin: "/admin",
  adminAccessLevels: "/admin/access-levels",
  adminBackups: "/admin/backups",
  adminCategories: "/admin/categories",
  adminCostManagement: "/admin/cost-management",
  adminDepartments: "/admin/departments",
  adminDocuments: "/admin/documents",
  adminHealth: "/admin/health",
  adminLogs: "/admin/logs",
  adminModels: "/admin/models",
  adminProfile: "/admin/profile",
  adminTickets: "/admin/tickets",
  adminRbac: "/admin/rbac",
  adminSettings: "/admin/settings",
  adminUsageLimits: "/admin/usage-limits",
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

export function ticketDetailPath(ticketId: string): string {
  return `${ROUTES.tickets}/${ticketId}`
}

export function adminTicketDetailPath(ticketId: string): string {
  return `${ROUTES.adminTickets}/${ticketId}`
}

// `restart`: chunk and embed an already-ingested document again from the
// preview step, instead of opening its saved progress (UNISAGE-103).
type IngestWizardPathOptions = { restart?: boolean }

function withRestart(path: string, options?: IngestWizardPathOptions) {
  return options?.restart
    ? `${path}?${INGEST_RESTART_PARAM}=${Date.now()}`
    : path
}

/** Search param that opens the ingest wizard from scratch; its value is a nonce. */
export const INGEST_RESTART_PARAM = "restart"

export function ingesterIngestWizardPath(
  documentId: string,
  options?: IngestWizardPathOptions
): string {
  return withRestart(`${ROUTES.ingesterProcessing}/${documentId}`, options)
}

export function adminDocumentIngestWizardPath(
  documentId: string,
  options?: IngestWizardPathOptions
): string {
  return withRestart(`${ROUTES.adminDocuments}/${documentId}/ingest`, options)
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

export function adminDocumentChunksPath(documentId: string): string {
  return `${ROUTES.adminDocuments}/${documentId}/chunks`
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

export function ingesterDocumentChunksPath(documentId: string): string {
  return `${ROUTES.ingesterDocuments}/${documentId}/chunks`
}

/** `/chat/<id>`: the open conversation lives in the URL, so a reload or a shared link
 * lands on the same conversation (like ChatGPT's `/c/<id>`). */
export function chatConversationPath(conversationId: string): string {
  return `${ROUTES.chat}/${conversationId}`
}
