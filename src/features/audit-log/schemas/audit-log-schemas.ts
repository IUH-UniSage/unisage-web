import { z } from "zod"

// Mirrors com.unisage.backend.entity.enums.AuditAction on the backend - keep
// in sync when it changes. UNISAGE-60's hybrid extension added LOGIN/
// LOGIN_FAILED/LOGOUT (domain events, published from AuthServiceImpl - this
// app checks passwords by hand and never goes through Spring Security's
// AuthenticationManager, so there's no built-in auth event to piggyback on)
// and DOWNLOAD/VIEW (an @Auditable AOP aspect on single-item detail reads,
// e.g. GET /documents/{id}, GET /users/{id} - never on list endpoints) on top
// of the original CREATE/UPDATE/DELETE Hibernate-listener-captured writes.
export const auditActionSchema = z.enum([
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGIN_FAILED",
  "LOGOUT",
  "DOWNLOAD",
  "VIEW",
])

export type AuditAction = z.infer<typeof auditActionSchema>

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: "Tạo mới",
  DELETE: "Xóa",
  DOWNLOAD: "Tải xuống",
  LOGIN: "Đăng nhập",
  LOGIN_FAILED: "Đăng nhập thất bại",
  LOGOUT: "Đăng xuất",
  UPDATE: "Cập nhật",
  VIEW: "Xem chi tiết",
}

const AUDIT_ACTION_BADGE_CLASSNAME: Record<AuditAction, string> = {
  CREATE: "border-transparent bg-success/10 text-success",
  DELETE: "border-transparent bg-destructive/10 text-destructive",
  DOWNLOAD: "border-transparent bg-violet/15 text-violet",
  LOGIN: "border-transparent bg-teal/15 text-teal",
  LOGIN_FAILED: "border-transparent bg-destructive/10 text-destructive",
  LOGOUT: "border-transparent bg-muted text-muted-foreground",
  UPDATE: "border-transparent bg-sky/10 text-sky",
  VIEW: "border-transparent bg-warning text-warning-foreground",
}

export function getAuditActionBadgeClassName(action: AuditAction): string {
  return AUDIT_ACTION_BADGE_CLASSNAME[action]
}

export const auditLogSchema = z.object({
  action: auditActionSchema,
  actorCode: z.string().nullish(),
  actorId: z.uuid().nullish(),
  actorName: z.string().nullish(),
  createdAt: z.string(),
  details: z.string().nullish(),
  id: z.uuid(),
  // Nullable for LOGIN_FAILED: a failed login attempt against a code that
  // matches no real user has no entity to point resourceId at (the typed
  // code is captured in `details` instead).
  resourceId: z.string().nullish(),
  resourceType: z.string(),
})

export type AuditLog = z.infer<typeof auditLogSchema>

export const auditLogPageSchema = z.object({
  data: z.array(auditLogSchema),
  limit: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export type AuditLogPage = z.infer<typeof auditLogPageSchema>
