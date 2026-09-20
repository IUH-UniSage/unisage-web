import { z } from "zod"

// Mirrors backend UNISAGE-62's Actuator-shaped status vocabulary
// (UP/DOWN/DEGRADED/OUT_OF_SERVICE) - see the UNISAGE-62/63 plan doc for why
// this piggybacks on Spring Boot Actuator's health-indicator conventions
// instead of a hand-rolled aggregator.
export const healthStatusSchema = z.enum([
  "UP",
  "DOWN",
  "DEGRADED",
  "OUT_OF_SERVICE",
])

export type HealthStatus = z.infer<typeof healthStatusSchema>

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  DEGRADED: "Suy giảm",
  DOWN: "Ngừng hoạt động",
  OUT_OF_SERVICE: "Ngoài dịch vụ",
  UP: "Hoạt động tốt",
}

const HEALTH_STATUS_BADGE_CLASSNAME: Record<HealthStatus, string> = {
  DEGRADED: "border-transparent bg-warning text-warning-foreground",
  DOWN: "border-transparent bg-destructive/10 text-destructive",
  OUT_OF_SERVICE: "border-transparent bg-muted text-muted-foreground",
  UP: "border-transparent bg-success/10 text-success",
}

export function getHealthStatusBadgeClassName(status: HealthStatus): string {
  return HEALTH_STATUS_BADGE_CLASSNAME[status]
}

const HEALTH_STATUS_DOT_CLASSNAME: Record<HealthStatus, string> = {
  DEGRADED: "bg-warning-foreground",
  DOWN: "bg-destructive",
  OUT_OF_SERVICE: "bg-muted-foreground",
  UP: "bg-success",
}

export function getHealthStatusDotClassName(status: HealthStatus): string {
  return HEALTH_STATUS_DOT_CLASSNAME[status]
}

export const componentHealthSchema = z.object({
  details: z.record(z.string(), z.unknown()).nullish(),
  responseTimeMs: z.number().nullish(),
  status: healthStatusSchema,
})

export type ComponentHealth = z.infer<typeof componentHealthSchema>

export const healthCheckResponseSchema = z.object({
  checkedAt: z.string(),
  components: z.record(z.string(), componentHealthSchema),
  overallStatus: healthStatusSchema,
})

export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>

export const healthHistoryPageSchema = z.object({
  data: z.array(healthCheckResponseSchema),
  limit: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export type HealthHistoryPage = z.infer<typeof healthHistoryPageSchema>

// Expected component keys per the UNISAGE-62 contract draft - Spring
// Actuator indicator bean names lowercased minus the `HealthIndicator`
// suffix (e.g. a `GatewayHealthIndicator` bean registers as `gateway`).
// UNCONFIRMED until the real backend branch lands; a component key present
// in the response but missing from this map still renders (see
// `getComponentLabel`/`getComponentIcon` fallbacks in
// `components/component-health-card.tsx`), so an unexpected key from the
// real backend degrades gracefully instead of disappearing.
export const KNOWN_COMPONENT_KEYS = ["db", "gateway", "agent", "minio"] as const

export type KnownComponentKey = (typeof KNOWN_COMPONENT_KEYS)[number]

export const COMPONENT_LABELS: Record<KnownComponentKey, string> = {
  agent: "Trợ lý AI",
  db: "Cơ sở dữ liệu",
  gateway: "Cổng API",
  minio: "Lưu trữ file",
}

export function getComponentLabel(key: string): string {
  return COMPONENT_LABELS[key as KnownComponentKey] ?? key
}
