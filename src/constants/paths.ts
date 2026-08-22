export const ROUTES = {
  home: "/",
  signIn: "/login",
  signUp: "/register",
  chat: "/chat",
  knowledge: "/knowledge",
  profile: "/profile",
  notifications: "/notifications",
  tickets: "/tickets",
  ingester: "/ingester",
  ingesterDocuments: "/ingester/documents",
  ingesterProcessing: "/ingester/processing",
  admin: "/admin",
  adminUsers: "/admin/users",
  adminDocuments: "/admin/documents",
  adminModels: "/admin/models",
  adminSettings: "/admin/settings",
  adminHealth: "/admin/health",
} as const

export type RouteKey = keyof typeof ROUTES
