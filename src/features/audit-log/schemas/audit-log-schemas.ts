import { z } from "zod"

// Mirrors com.unisage.backend.entity.enums.AuditAction (or equivalent) on the
// backend - keep in sync when it changes. UNISAGE-60's contract only ever
// records mutating operations, so there is no READ value.
export const auditActionSchema = z.enum(["CREATE", "UPDATE", "DELETE"])

export type AuditAction = z.infer<typeof auditActionSchema>

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: "Tạo mới",
  DELETE: "Xóa",
  UPDATE: "Cập nhật",
}

const AUDIT_ACTION_BADGE_CLASSNAME: Record<AuditAction, string> = {
  CREATE: "border-transparent bg-success/10 text-success",
  DELETE: "border-transparent bg-destructive/10 text-destructive",
  UPDATE: "border-transparent bg-sky/10 text-sky",
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
  resourceId: z.string(),
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
