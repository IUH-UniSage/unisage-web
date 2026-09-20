import { z } from "zod"

// Mirrors com.unisage.backend.entity.enums.SystemConfigValueType /
// SystemConfigCategory on the backend (UNISAGE-64) - keep in sync when it
// changes. AUDIT has no seeded rows in the first migration pass, so that tab
// can legitimately render empty - see EMPTY_CATEGORY_MESSAGE in
// category-config-form.tsx.
export const systemConfigValueTypeSchema = z.enum([
  "STRING",
  "NUMBER",
  "BOOLEAN",
  "JSON",
])

export type SystemConfigValueType = z.infer<typeof systemConfigValueTypeSchema>

export const systemConfigCategorySchema = z.enum([
  "GENERAL",
  "SECURITY",
  "INGEST",
  "CHAT",
  "AUDIT",
  "MAINTENANCE",
])

export type SystemConfigCategory = z.infer<typeof systemConfigCategorySchema>

export const SYSTEM_CONFIG_CATEGORY_LABELS: Record<
  SystemConfigCategory,
  string
> = {
  AUDIT: "Nhật ký",
  CHAT: "Trò chuyện",
  GENERAL: "Chung",
  INGEST: "Nạp liệu",
  MAINTENANCE: "Bảo trì",
  SECURITY: "Bảo mật",
}

// Fixed display order for the settings tabs - independent of whatever order
// the backend happens to return rows in.
export const SYSTEM_CONFIG_CATEGORY_ORDER: SystemConfigCategory[] = [
  "GENERAL",
  "SECURITY",
  "INGEST",
  "CHAT",
  "AUDIT",
  "MAINTENANCE",
]

// createdByName/updatedByName follow the null-safe audit-attribution shape
// used across the app (see access-level-schemas.ts, AuditInfo) - a config
// row touched by a migration/seed rather than a signed-in admin has no
// createdBy/updatedBy, so these stay nullish rather than required strings.
export const systemConfigSchema = z.object({
  category: systemConfigCategorySchema,
  configKey: z.string(),
  createdAt: z.string().nullish(),
  createdByName: z.string().nullish(),
  description: z.string().nullish(),
  id: z.uuid(),
  isEditable: z.boolean(),
  label: z.string(),
  updatedAt: z.string().nullish(),
  updatedByName: z.string().nullish(),
  value: z.string(),
  valueType: systemConfigValueTypeSchema,
})

export type SystemConfig = z.infer<typeof systemConfigSchema>

// Contract assumption (unconfirmed against the real backend at build time,
// per UNISAGE-65's task brief): GET /system-configs returns a plain array
// (`ApiResponse<SystemConfigResponse[]>`), not a paginated PageResponse -
// there are only 11 seeded rows total, so pagination would be pure overhead
// for a settings page. If the real backend paginates instead, swap this for
// `pageSchema(systemConfigSchema)` and adjust system-config-api.ts's return
// type/unwrapping to match.
export const systemConfigListSchema = z.array(systemConfigSchema)

// PUT /system-configs/{configKey} updates only `value` - key/type/category
// are fixed once seeded (see the plan doc), so this is the only writable
// field.
export const updateSystemConfigRequestSchema = z.object({
  value: z.string(),
})

export type UpdateSystemConfigRequest = z.infer<
  typeof updateSystemConfigRequestSchema
>
